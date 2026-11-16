class ToggleCommentLikeUseCase {
  /**
   * @param {import('../../Domains/Repositories/CommentLikeRepository')} commentLikeRepository
   * @param {import('../../Domains/Repositories/CommentRepository')} commentRepository
   * @param {import('../../Domains/Repositories/ThreadRepository')} threadRepository
   */
  constructor(commentLikeRepository, commentRepository, threadRepository) {
    this._commentLikeRepository = commentLikeRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async toggleLike({ threadId, commentId, owner }) {
    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(commentId);
    await this._commentLikeRepository.toggleLike(commentId, owner);
  }
}

module.exports = ToggleCommentLikeUseCase;
