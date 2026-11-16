class ThreadUseCase {
  /** @param {import('../../Domains/Repositories/ThreadRepository')} threadRepository */
  constructor(threadRepository) {
    this._threadRepository = threadRepository;
  }

  async addThread({ title, body, owner }) {
    return this._threadRepository.addThread({ title, body, owner });
  }

  async getThreadById(id) {
    await this._threadRepository.verifyThreadExists(id);
    return this._threadRepository.getThreadById(id);
  }
}

module.exports = ThreadUseCase;
