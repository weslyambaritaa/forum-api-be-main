const { randomUUID } = require('crypto');
const pool = require('../src/Infrastructures/Database/postgresPool');
const PostgresUserRepository = require('../src/Infrastructures/Repositories/PostgresUserRepository');
const PostgresAuthenticationRepository = require('../src/Infrastructures/Repositories/PostgresAuthenticationRepository');
const PostgresThreadRepository = require('../src/Infrastructures/Repositories/PostgresThreadRepository');
const PostgresCommentRepository = require('../src/Infrastructures/Repositories/PostgresCommentRepository');
const PostgresReplyRepository = require('../src/Infrastructures/Repositories/PostgresReplyRepository');
const PostgresCommentLikeRepository = require('../src/Infrastructures/Repositories/PostgresCommentLikeRepository');
const InvariantError = require('../src/commons/exceptions/InvariantError');
const NotFoundError = require('../src/commons/exceptions/NotFoundError');
const AuthorizationError = require('../src/commons/exceptions/AuthorizationError');

describe('PostgreSQL repositories integration', () => {
  let ids;

  beforeEach(async () => {
    const suffix = randomUUID().replaceAll('-', '').slice(0, 12);
    ids = {
      user: `user-owner-${suffix}`,
      otherUser: `user-other-${suffix}`,
      thread: `thread-${suffix}`,
      comment: `comment-${suffix}`,
      reply: `reply-${suffix}`,
      token: `refresh-token-${suffix}`,
    };
    await pool.query(
      'INSERT INTO users (id, username, password, fullname) VALUES ($1, $2, $3, $4), ($5, $6, $7, $8)',
      [ids.user, `owner_${suffix}`, 'hashed-password', 'Owner', ids.otherUser, `other_${suffix}`, 'hash', 'Other']
    );
    await pool.query(
      'INSERT INTO threads (id, title, body, owner, date) VALUES ($1, $2, $3, $4, $5)',
      [ids.thread, 'Thread title', 'Thread body', ids.user, '2024-01-01T00:00:00.000Z']
    );
    await pool.query(
      'INSERT INTO comments (id, thread_id, content, owner, date) VALUES ($1, $2, $3, $4, $5)',
      [ids.comment, ids.thread, 'Comment content', ids.user, '2024-01-02T00:00:00.000Z']
    );
    await pool.query(
      'INSERT INTO replies (id, comment_id, content, owner, date) VALUES ($1, $2, $3, $4, $5)',
      [ids.reply, ids.comment, 'Reply content', ids.user, '2024-01-03T00:00:00.000Z']
    );
  });

  afterEach(async () => {
    if (ids) {
      await pool.query('DELETE FROM authentications WHERE token = $1', [ids.token]);
      await pool.query('DELETE FROM users WHERE id = ANY($1::text[])', [[ids.user, ids.otherUser]]);
    }
  });

  afterAll(async () => {
    await pool.end();
  });

  it('persists users and reads their credentials and public profile', async () => {
    const repository = new PostgresUserRepository(pool);
    const username = `new_${randomUUID().slice(0, 8)}`;

    await expect(repository.verifyUsernameAvailable(username)).resolves.toBeUndefined();
    await expect(repository.verifyUsernameAvailable(`owner_${ids.user.slice(-12)}`))
      .rejects.toBeInstanceOf(InvariantError);
    const addedUser = await repository.addUser({ username, password: 'hashed', fullname: 'New User' });
    expect(addedUser).toMatchObject({ username, fullname: 'New User' });
    expect(addedUser.id).toMatch(/^user-/);
    expect(await repository.getPasswordByUsername(username)).toEqual({ id: addedUser.id, password: 'hashed' });
    expect(await repository.getUserById(addedUser.id)).toEqual(addedUser);
    await expect(repository.getPasswordByUsername('username-does-not-exist'))
      .rejects.toBeInstanceOf(InvariantError);
    await expect(repository.getUserById('user-does-not-exist')).resolves.toBeUndefined();
  });

  it('adds, checks, and deletes refresh tokens in PostgreSQL', async () => {
    const repository = new PostgresAuthenticationRepository(pool);

    await expect(repository.checkTokenAvailability(ids.token)).rejects.toBeInstanceOf(InvariantError);
    await repository.addToken(ids.token);
    await expect(repository.checkTokenAvailability(ids.token)).resolves.toBeUndefined();
    await repository.deleteToken(ids.token);
    await expect(repository.checkTokenAvailability(ids.token)).rejects.toBeInstanceOf(InvariantError);
  });

  it('creates threads, verifies them, and reads their owner username', async () => {
    const repository = new PostgresThreadRepository(pool);

    await expect(repository.verifyThreadExists(ids.thread)).resolves.toBeUndefined();
    const thread = await repository.getThreadById(ids.thread);
    expect(thread).toMatchObject({
      id: ids.thread, title: 'Thread title', body: 'Thread body', username: `owner_${ids.user.slice(-12)}`,
    });
    const added = await repository.addThread({ title: 'New title', body: 'New body', owner: ids.user });
    expect(added).toMatchObject({ title: 'New title', owner: ids.user });
    expect(added.id).toMatch(/^thread-/);
    await expect(repository.verifyThreadExists('thread-missing')).rejects.toBeInstanceOf(NotFoundError);
    await expect(repository.getThreadById('thread-missing')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('creates, verifies, soft-deletes, and lists comments in ascending date order', async () => {
    const repository = new PostgresCommentRepository(pool);

    await expect(repository.verifyCommentExists(ids.comment)).resolves.toBeUndefined();
    await expect(repository.verifyCommentOwner(ids.comment, ids.user)).resolves.toBeUndefined();
    await expect(repository.verifyCommentOwner(ids.comment, ids.otherUser)).rejects.toBeInstanceOf(AuthorizationError);
    await expect(repository.verifyCommentExists('comment-missing')).rejects.toBeInstanceOf(NotFoundError);
    await expect(repository.verifyCommentOwner('comment-missing', ids.user)).rejects.toBeInstanceOf(NotFoundError);

    const added = await repository.addComment({ content: 'Later comment', owner: ids.otherUser, threadId: ids.thread });
    expect(added).toMatchObject({ content: 'Later comment', owner: ids.otherUser });
    expect(added.id).toMatch(/^comment-/);
    const ordered = await repository.getCommentsByThreadId(ids.thread);
    expect(ordered.map((comment) => comment.id)).toEqual([ids.comment, added.id]);

    await repository.deleteComment(ids.comment);
    const deleted = await pool.query('SELECT is_delete FROM comments WHERE id = $1', [ids.comment]);
    expect(deleted.rows[0].is_delete).toBe(true);
  });

  it('creates, verifies, soft-deletes, and lists replies in ascending date order', async () => {
    const repository = new PostgresReplyRepository(pool);

    await expect(repository.verifyReplyExists(ids.reply)).resolves.toBeUndefined();
    await expect(repository.verifyReplyOwner(ids.reply, ids.user)).resolves.toBeUndefined();
    await expect(repository.verifyReplyOwner(ids.reply, ids.otherUser)).rejects.toBeInstanceOf(AuthorizationError);
    await expect(repository.verifyReplyExists('reply-missing')).rejects.toBeInstanceOf(NotFoundError);
    await expect(repository.verifyReplyOwner('reply-missing', ids.user)).rejects.toBeInstanceOf(NotFoundError);

    const added = await repository.addReply({ content: 'Later reply', owner: ids.otherUser, commentId: ids.comment });
    expect(added).toMatchObject({ content: 'Later reply', owner: ids.otherUser });
    expect(added.id).toMatch(/^reply-/);
    const ordered = await repository.getRepliesByCommentId(ids.comment);
    expect(ordered.map((reply) => reply.id)).toEqual([ids.reply, added.id]);

    await repository.deleteReply(ids.reply);
    const deleted = await pool.query('SELECT is_delete FROM replies WHERE id = $1', [ids.reply]);
    expect(deleted.rows[0].is_delete).toBe(true);
  });

  it('checks, toggles, and counts comment likes', async () => {
    const repository = new PostgresCommentLikeRepository(pool);

    await expect(repository.isCommentLikedByUser(ids.comment, ids.user)).resolves.toBe(false);
    await expect(repository.getLikeCountsByCommentIds([])).resolves.toEqual({});
    await repository.addLike(ids.comment, ids.user);
    await expect(repository.isCommentLikedByUser(ids.comment, ids.user)).resolves.toBe(true);
    await repository.addLike(ids.comment, ids.otherUser);
    await expect(repository.getLikeCountsByCommentIds([ids.comment])).resolves.toEqual({ [ids.comment]: 2 });

    await repository.toggleLike(ids.comment, ids.user);
    await expect(repository.isCommentLikedByUser(ids.comment, ids.user)).resolves.toBe(false);
    await repository.toggleLike(ids.comment, ids.user);
    await expect(repository.isCommentLikedByUser(ids.comment, ids.user)).resolves.toBe(true);
  });
});
