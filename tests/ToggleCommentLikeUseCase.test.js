const ToggleCommentLikeUseCase = require('../src/Applications/UseCases/ToggleCommentLikeUseCase');

describe('ToggleCommentLikeUseCase', () => {
  it('toggles a like after verifying the thread and comment exist', async () => {
    const fakeThreadRepository = { verifyThreadExists: jest.fn().mockResolvedValue() };
    const fakeCommentRepository = { verifyCommentExists: jest.fn().mockResolvedValue() };
    const fakeCommentLikeRepository = { toggleLike: jest.fn().mockResolvedValue() };

    const useCase = new ToggleCommentLikeUseCase(fakeCommentLikeRepository, fakeCommentRepository, fakeThreadRepository);
    await useCase.toggleLike({ threadId: 'thread-123', commentId: 'comment-123', owner: 'user-123' });

    expect(fakeThreadRepository.verifyThreadExists).toHaveBeenCalledWith('thread-123');
    expect(fakeCommentRepository.verifyCommentExists).toHaveBeenCalledWith('comment-123');
    expect(fakeCommentLikeRepository.toggleLike).toHaveBeenCalledWith('comment-123', 'user-123');
  });

  it('does not verify the comment or toggle when the thread does not exist', async () => {
    const threadRepository = { verifyThreadExists: jest.fn().mockRejectedValue(new Error('thread missing')) };
    const commentRepository = { verifyCommentExists: jest.fn() };
    const commentLikeRepository = { toggleLike: jest.fn() };
    const useCase = new ToggleCommentLikeUseCase(commentLikeRepository, commentRepository, threadRepository);

    await expect(useCase.toggleLike({ threadId: 'missing', commentId: 'comment-1', owner: 'user-1' }))
      .rejects.toThrow('thread missing');
    expect(commentRepository.verifyCommentExists).not.toHaveBeenCalled();
    expect(commentLikeRepository.toggleLike).not.toHaveBeenCalled();
  });

  it('does not toggle when the comment does not exist', async () => {
    const threadRepository = { verifyThreadExists: jest.fn().mockResolvedValue() };
    const commentRepository = { verifyCommentExists: jest.fn().mockRejectedValue(new Error('comment missing')) };
    const commentLikeRepository = { toggleLike: jest.fn() };
    const useCase = new ToggleCommentLikeUseCase(commentLikeRepository, commentRepository, threadRepository);

    await expect(useCase.toggleLike({ threadId: 'thread-1', commentId: 'missing', owner: 'user-1' }))
      .rejects.toThrow('comment missing');
    expect(commentLikeRepository.toggleLike).not.toHaveBeenCalled();
  });
});
