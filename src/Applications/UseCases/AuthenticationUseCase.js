class AuthenticationUseCase {
  /**
   * @param {import('../../Domains/Repositories/UserRepository')} userRepository
   * @param {import('../../Domains/Repositories/AuthenticationRepository')} authenticationRepository
   * @param {{ compare: Function }} passwordManager
   * @param {{ generateAccessToken: Function, generateRefreshToken: Function, verifyRefreshToken: Function }} tokenManager
   */
  constructor(userRepository, authenticationRepository, passwordManager, tokenManager) {
    this._userRepository = userRepository;
    this._authenticationRepository = authenticationRepository;
    this._passwordManager = passwordManager;
    this._tokenManager = tokenManager;
  }

  async login({ username, password: rawPassword }) {
    const { id, password: hashedPassword } = await this._userRepository.getPasswordByUsername(username);
    await this._passwordManager.compare(rawPassword, hashedPassword);

    const accessToken = this._tokenManager.generateAccessToken({ id });
    const refreshToken = this._tokenManager.generateRefreshToken({ id });

    await this._authenticationRepository.addToken(refreshToken);

    return { accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken) {
    const { id } = this._tokenManager.verifyRefreshToken(refreshToken);
    await this._authenticationRepository.checkTokenAvailability(refreshToken);
    return this._tokenManager.generateAccessToken({ id });
  }

  async logout(refreshToken) {
    await this._authenticationRepository.checkTokenAvailability(refreshToken);
    await this._authenticationRepository.deleteToken(refreshToken);
  }
}

module.exports = AuthenticationUseCase;
