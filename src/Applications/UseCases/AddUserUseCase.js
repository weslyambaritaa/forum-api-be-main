class AddUserUseCase {
  /**
   * @param {import('../../Domains/Repositories/UserRepository')} userRepository
   * @param {{ hash: Function }} passwordManager
   */
  constructor(userRepository, passwordManager) {
    this._userRepository = userRepository;
    this._passwordManager = passwordManager;
  }

  async addUser({ username, password: rawPassword, fullname }) {
    await this._userRepository.verifyUsernameAvailable(username);
    const hashedPassword = await this._passwordManager.hash(rawPassword);
    return this._userRepository.addUser({ username, password: hashedPassword, fullname });
  }
}

module.exports = AddUserUseCase;
