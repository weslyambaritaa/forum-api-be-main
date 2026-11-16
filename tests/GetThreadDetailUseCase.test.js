const GetThreadDetailUseCase = require('../src/Applications/UseCases/GetThreadDetailUseCase');

describe('GetThreadDetailUseCase', () => {
  it('replaces deleted comment/reply content and includes like counts', async () => {
    const fakeThreadRepository = {
      getThreadById: jest.fn().mockResolvedValue({
        id: 'thread-123', title: 'a thread', body: 'a body', date: '2021-08-13', username: 'dicoding',
      }),
    };
    const fakeCommentRepository = {
      getCommentsByThreadId: jest.fn().mockResolvedValue([
        {
          id: 'comment-1', username: 'dicoding', date: '2021-08-13', content: 'a comment', is_delete: false,
        },
        {
          id: 'comment-2', username: 'johndoe', date: '2021-08-13', content: 'deleted content', is_delete: true,
        },
      ]),
    };
    const fakeReplyRepository = {
      getRepliesByCommentId: jest.fn().mockResolvedValue([]),
    };
    const fakeCommentLikeRepository = {
      getLikeCountsByCommentIds: jest.fn().mockResolvedValue({ 'comment-1': 2 }),
    };

    const useCase = new GetThreadDetailUseCase(
      fakeThreadRepository, fakeCommentRepository, fakeReplyRepository, fakeCommentLikeRepository
    );
    const thread = await useCase.getThreadDetail('thread-123');

    expect(thread.comments[0].content).toEqual('a comment');
    expect(thread.comments[0].likeCount).toEqual(2);
    expect(thread.comments[1].content).toEqual('**komentar telah dihapus**');
    expect(thread.comments[1].likeCount).toEqual(0);
  });

  it('maps active and deleted replies and requests like counts for the thread comments', async () => {
    const threadRepository = {
      getThreadById: jest.fn().mockResolvedValue({ id: 'thread-1', title: 'title', body: 'body' }),
    };
    const commentRepository = {
      getCommentsByThreadId: jest.fn().mockResolvedValue([
        { id: 'comment-1', username: 'alice', date: '2024-01-01', content: 'content', is_delete: false },
      ]),
    };
    const replyRepository = {
      getRepliesByCommentId: jest.fn().mockResolvedValue([
        { id: 'reply-1', username: 'bob', date: '2024-01-02', content: 'reply', is_delete: false },
        { id: 'reply-2', username: 'alice', date: '2024-01-03', content: 'removed', is_delete: true },
      ]),
    };
    const commentLikeRepository = { getLikeCountsByCommentIds: jest.fn().mockResolvedValue({ 'comment-1': 3 }) };
    const useCase = new GetThreadDetailUseCase(
      threadRepository, commentRepository, replyRepository, commentLikeRepository
    );

    const result = await useCase.getThreadDetail('thread-1');

    expect(commentLikeRepository.getLikeCountsByCommentIds).toHaveBeenCalledWith(['comment-1']);
    expect(replyRepository.getRepliesByCommentId).toHaveBeenCalledWith('comment-1');
    expect(result.comments[0]).toEqual({
      id: 'comment-1', username: 'alice', date: '2024-01-01', content: 'content', likeCount: 3,
      replies: [
        { id: 'reply-1', content: 'reply', date: '2024-01-02', username: 'bob' },
        { id: 'reply-2', content: '**balasan telah dihapus**', date: '2024-01-03', username: 'alice' },
      ],
    });
  });

  it('returns an empty comments list and requests empty like counts for a thread without comments', async () => {
    const threadRepository = { getThreadById: jest.fn().mockResolvedValue({ id: 'thread-1' }) };
    const commentRepository = { getCommentsByThreadId: jest.fn().mockResolvedValue([]) };
    const replyRepository = { getRepliesByCommentId: jest.fn() };
    const commentLikeRepository = { getLikeCountsByCommentIds: jest.fn().mockResolvedValue({}) };
    const useCase = new GetThreadDetailUseCase(
      threadRepository, commentRepository, replyRepository, commentLikeRepository
    );

    await expect(useCase.getThreadDetail('thread-1')).resolves.toEqual({ id: 'thread-1', comments: [] });
    expect(commentLikeRepository.getLikeCountsByCommentIds).toHaveBeenCalledWith([]);
    expect(replyRepository.getRepliesByCommentId).not.toHaveBeenCalled();
  });

  it('does not load comments when the requested thread cannot be found', async () => {
    const threadRepository = { getThreadById: jest.fn().mockRejectedValue(new Error('thread missing')) };
    const commentRepository = { getCommentsByThreadId: jest.fn() };
    const useCase = new GetThreadDetailUseCase(
      threadRepository, commentRepository, {}, {}
    );

    await expect(useCase.getThreadDetail('missing')).rejects.toThrow('thread missing');
    expect(commentRepository.getCommentsByThreadId).not.toHaveBeenCalled();
  });
});
