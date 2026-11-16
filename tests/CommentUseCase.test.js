const CommentUseCase = require('../src/Applications/UseCases/CommentUseCase');

describe('CommentUseCase', () => {
  it('verifies the thread exists before adding a comment', async () => {
    const fakeThreadRepository = { verifyThreadExists: jest.fn().mockResolvedValue() };
    const fakeCommentRepository = {
      addComment: jest.fn().mockResolvedValue({ id: 'comment-123', content: 'a comment', owner: 'user-123' }),
    };

    const useCase = new CommentUseCase(fakeCommentRepository, fakeThreadRepository);
    const result = await useCase.addComment({ content: 'a comment', owner: 'user-123', threadId: 'thread-123' });

    expect(fakeThreadRepository.verifyThreadExists).toHaveBeenCalledWith('thread-123');
    expect(result).toEqual({ id: 'comment-123', content: 'a comment', owner: 'user-123' });
  });

  it('only allows the owner to delete their own comment', async () => {
    const fakeThreadRepository = { verifyThreadExists: jest.fn().mockResolvedValue() };
    const fakeCommentRepository = {
      verifyCommentOwner: jest.fn().mockResolvedValue(),
      deleteComment: jest.fn().mockResolvedValue(),
    };

    const useCase = new CommentUseCase(fakeCommentRepository, fakeThreadRepository);
    await useCase.deleteComment({ threadId: 'thread-123', commentId: 'comment-123', owner: 'user-123' });

    expect(fakeCommentRepository.verifyCommentOwner).toHaveBeenCalledWith('comment-123', 'user-123');
    expect(fakeCommentRepository.deleteComment).toHaveBeenCalledWith('comment-123');
  });

  it('does not add a comment when the thread does not exist', async () => {
    const error = new Error('thread missing');
    const threadRepository = { verifyThreadExists: jest.fn().mockRejectedValue(error) };
    const commentRepository = { addComment: jest.fn() };
    const useCase = new CommentUseCase(commentRepository, threadRepository);

    await expect(useCase.addComment({ threadId: 'missing', content: 'content', owner: 'user-1' }))
      .rejects.toBe(error);
    expect(commentRepository.addComment).not.toHaveBeenCalled();
  });

  it('does not verify comment ownership or delete when the thread does not exist', async () => {
    const error = new Error('thread missing');
    const threadRepository = { verifyThreadExists: jest.fn().mockRejectedValue(error) };
    const commentRepository = {
      verifyCommentOwner: jest.fn(),
      deleteComment: jest.fn(),
    };
    const useCase = new CommentUseCase(commentRepository, threadRepository);

    await expect(useCase.deleteComment({ threadId: 'missing', commentId: 'comment-1', owner: 'user-1' }))
      .rejects.toBe(error);
    expect(commentRepository.verifyCommentOwner).not.toHaveBeenCalled();
    expect(commentRepository.deleteComment).not.toHaveBeenCalled();
  });

  it('does not delete a comment when ownership verification fails', async () => {
    const commentRepository = {
      verifyCommentOwner: jest.fn().mockRejectedValue(new Error('forbidden')),
      deleteComment: jest.fn(),
    };
    const useCase = new CommentUseCase(commentRepository, {
      verifyThreadExists: jest.fn().mockResolvedValue(),
    });

    await expect(useCase.deleteComment({ threadId: 'thread-1', commentId: 'comment-1', owner: 'other-user' }))
      .rejects.toThrow('forbidden');
    expect(commentRepository.deleteComment).not.toHaveBeenCalled();
  });
});
