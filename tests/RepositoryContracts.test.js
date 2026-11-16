const UserRepository = require('../src/Domains/Repositories/UserRepository');
const AuthenticationRepository = require('../src/Domains/Repositories/AuthenticationRepository');
const ThreadRepository = require('../src/Domains/Repositories/ThreadRepository');
const CommentRepository = require('../src/Domains/Repositories/CommentRepository');
const ReplyRepository = require('../src/Domains/Repositories/ReplyRepository');
const CommentLikeRepository = require('../src/Domains/Repositories/CommentLikeRepository');

describe('Domain repository contracts', () => {
  it.each([
    [UserRepository, 'verifyUsernameAvailable', 'USER_REPOSITORY.METHOD_NOT_IMPLEMENTED'],
    [UserRepository, 'addUser', 'USER_REPOSITORY.METHOD_NOT_IMPLEMENTED'],
    [UserRepository, 'getPasswordByUsername', 'USER_REPOSITORY.METHOD_NOT_IMPLEMENTED'],
    [UserRepository, 'getUserById', 'USER_REPOSITORY.METHOD_NOT_IMPLEMENTED'],
    [AuthenticationRepository, 'addToken', 'AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED'],
    [AuthenticationRepository, 'checkTokenAvailability', 'AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED'],
    [AuthenticationRepository, 'deleteToken', 'AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED'],
    [ThreadRepository, 'addThread', 'THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED'],
    [ThreadRepository, 'verifyThreadExists', 'THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED'],
    [ThreadRepository, 'getThreadById', 'THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED'],
    [CommentRepository, 'addComment', 'COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED'],
    [CommentRepository, 'verifyCommentExists', 'COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED'],
    [CommentRepository, 'verifyCommentOwner', 'COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED'],
    [CommentRepository, 'deleteComment', 'COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED'],
    [CommentRepository, 'getCommentsByThreadId', 'COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED'],
    [ReplyRepository, 'addReply', 'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED'],
    [ReplyRepository, 'verifyReplyExists', 'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED'],
    [ReplyRepository, 'verifyReplyOwner', 'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED'],
    [ReplyRepository, 'deleteReply', 'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED'],
    [ReplyRepository, 'getRepliesByCommentId', 'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED'],
    [CommentLikeRepository, 'isCommentLikedByUser', 'COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED'],
    [CommentLikeRepository, 'addLike', 'COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED'],
    [CommentLikeRepository, 'removeLike', 'COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED'],
    [CommentLikeRepository, 'toggleLike', 'COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED'],
    [CommentLikeRepository, 'getLikeCountsByCommentIds', 'COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED'],
  ])('%s.%s throws until an adapter implements it', (Repository, methodName, errorMessage) => {
    expect(() => new Repository()[methodName]()).toThrow(errorMessage);
  });
});
