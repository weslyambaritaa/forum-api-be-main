const ReplyUseCase = require('../src/Applications/UseCases/ReplyUseCase');

describe('ReplyUseCase', () => {
  const createRepositories = () => ({
    replyRepository: {
      addReply: jest.fn().mockResolvedValue({ id: 'reply-1', content: 'reply', owner: 'user-1' }),
      verifyReplyOwner: jest.fn().mockResolvedValue(),
      deleteReply: jest.fn().mockResolvedValue(),
    },
    commentRepository: {
      verifyCommentExists: jest.fn().mockResolvedValue(),
    },
    threadRepository: {
      verifyThreadExists: jest.fn().mockResolvedValue(),
    },
  });

  it('verifies parent resources before adding a reply', async () => {
    const repositories = createRepositories();
    const useCase = new ReplyUseCase(
      repositories.replyRepository, repositories.commentRepository, repositories.threadRepository
    );
    const input = { content: 'reply', owner: 'user-1', threadId: 'thread-1', commentId: 'comment-1' };

    await expect(useCase.addReply(input)).resolves.toEqual({ id: 'reply-1', content: 'reply', owner: 'user-1' });
    expect(repositories.threadRepository.verifyThreadExists).toHaveBeenCalledWith('thread-1');
    expect(repositories.commentRepository.verifyCommentExists).toHaveBeenCalledWith('comment-1');
    expect(repositories.replyRepository.addReply).toHaveBeenCalledWith({
      content: 'reply', owner: 'user-1', commentId: 'comment-1',
    });
  });

  it('does not verify a comment or add a reply when the thread is missing', async () => {
    const repositories = createRepositories();
    const error = new Error('thread missing');
    repositories.threadRepository.verifyThreadExists.mockRejectedValue(error);
    const useCase = new ReplyUseCase(
      repositories.replyRepository, repositories.commentRepository, repositories.threadRepository
    );

    await expect(useCase.addReply({ threadId: 'missing', commentId: 'comment-1' })).rejects.toBe(error);
    expect(repositories.commentRepository.verifyCommentExists).not.toHaveBeenCalled();
    expect(repositories.replyRepository.addReply).not.toHaveBeenCalled();
  });

  it('does not add a reply when its comment is missing', async () => {
    const repositories = createRepositories();
    const error = new Error('comment missing');
    repositories.commentRepository.verifyCommentExists.mockRejectedValue(error);
    const useCase = new ReplyUseCase(
      repositories.replyRepository, repositories.commentRepository, repositories.threadRepository
    );

    await expect(useCase.addReply({ threadId: 'thread-1', commentId: 'missing' })).rejects.toBe(error);
    expect(repositories.replyRepository.addReply).not.toHaveBeenCalled();
  });

  it('verifies parent resources and ownership before deleting a reply', async () => {
    const repositories = createRepositories();
    const useCase = new ReplyUseCase(
      repositories.replyRepository, repositories.commentRepository, repositories.threadRepository
    );

    await expect(useCase.deleteReply({
      threadId: 'thread-1', commentId: 'comment-1', replyId: 'reply-1', owner: 'user-1',
    })).resolves.toBeUndefined();
    expect(repositories.replyRepository.verifyReplyOwner).toHaveBeenCalledWith('reply-1', 'user-1');
    expect(repositories.replyRepository.deleteReply).toHaveBeenCalledWith('reply-1');
  });

  it('does not verify ownership or delete when the thread is missing', async () => {
    const repositories = createRepositories();
    const error = new Error('thread missing');
    repositories.threadRepository.verifyThreadExists.mockRejectedValue(error);
    const useCase = new ReplyUseCase(
      repositories.replyRepository, repositories.commentRepository, repositories.threadRepository
    );

    await expect(useCase.deleteReply({ threadId: 'missing' })).rejects.toBe(error);
    expect(repositories.commentRepository.verifyCommentExists).not.toHaveBeenCalled();
    expect(repositories.replyRepository.verifyReplyOwner).not.toHaveBeenCalled();
    expect(repositories.replyRepository.deleteReply).not.toHaveBeenCalled();
  });

  it('does not verify ownership or delete when the comment is missing', async () => {
    const repositories = createRepositories();
    const error = new Error('comment missing');
    repositories.commentRepository.verifyCommentExists.mockRejectedValue(error);
    const useCase = new ReplyUseCase(
      repositories.replyRepository, repositories.commentRepository, repositories.threadRepository
    );

    await expect(useCase.deleteReply({ threadId: 'thread-1', commentId: 'missing' })).rejects.toBe(error);
    expect(repositories.replyRepository.verifyReplyOwner).not.toHaveBeenCalled();
    expect(repositories.replyRepository.deleteReply).not.toHaveBeenCalled();
  });

  it('does not delete when the requester is not the reply owner', async () => {
    const repositories = createRepositories();
    repositories.replyRepository.verifyReplyOwner.mockRejectedValue(new Error('forbidden'));
    const useCase = new ReplyUseCase(
      repositories.replyRepository, repositories.commentRepository, repositories.threadRepository
    );

    await expect(useCase.deleteReply({
      threadId: 'thread-1', commentId: 'comment-1', replyId: 'reply-1', owner: 'other-user',
    })).rejects.toThrow('forbidden');
    expect(repositories.replyRepository.deleteReply).not.toHaveBeenCalled();
  });
});
