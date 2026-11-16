const AuthenticationUseCase = require('../src/Applications/UseCases/AuthenticationUseCase');

describe('AuthenticationUseCase', () => {
  const createUseCase = () => {
    const userRepository = {
      getPasswordByUsername: jest.fn().mockResolvedValue({ id: 'user-1', password: 'hashed-password' }),
    };
    const authenticationRepository = {
      addToken: jest.fn().mockResolvedValue(),
      checkTokenAvailability: jest.fn().mockResolvedValue(),
      deleteToken: jest.fn().mockResolvedValue(),
    };
    const passwordManager = { compare: jest.fn().mockResolvedValue() };
    const tokenManager = {
      generateAccessToken: jest.fn().mockReturnValue('access-token'),
      generateRefreshToken: jest.fn().mockReturnValue('refresh-token'),
      verifyRefreshToken: jest.fn().mockReturnValue({ id: 'user-1' }),
    };
    return {
      useCase: new AuthenticationUseCase(
        userRepository, authenticationRepository, passwordManager, tokenManager
      ),
      userRepository,
      authenticationRepository,
      passwordManager,
      tokenManager,
    };
  };

  it('verifies credentials, issues both tokens, and stores the refresh token', async () => {
    const { useCase, userRepository, authenticationRepository, passwordManager, tokenManager } = createUseCase();

    await expect(useCase.login({ username: 'alice', password: 'secret' })).resolves.toEqual({
      accessToken: 'access-token', refreshToken: 'refresh-token',
    });
    expect(userRepository.getPasswordByUsername).toHaveBeenCalledWith('alice');
    expect(passwordManager.compare).toHaveBeenCalledWith('secret', 'hashed-password');
    expect(tokenManager.generateAccessToken).toHaveBeenCalledWith({ id: 'user-1' });
    expect(tokenManager.generateRefreshToken).toHaveBeenCalledWith({ id: 'user-1' });
    expect(authenticationRepository.addToken).toHaveBeenCalledWith('refresh-token');
  });

  it('does not issue tokens when password comparison fails', async () => {
    const context = createUseCase();
    const error = new Error('invalid password');
    context.passwordManager.compare.mockRejectedValue(error);

    await expect(context.useCase.login({ username: 'alice', password: 'wrong' })).rejects.toBe(error);
    expect(context.tokenManager.generateAccessToken).not.toHaveBeenCalled();
    expect(context.authenticationRepository.addToken).not.toHaveBeenCalled();
  });

  it('verifies a refresh token before checking it and issuing an access token', async () => {
    const { useCase, authenticationRepository, tokenManager } = createUseCase();

    await expect(useCase.refreshAccessToken('refresh-token')).resolves.toBe('access-token');
    expect(tokenManager.verifyRefreshToken).toHaveBeenCalledWith('refresh-token');
    expect(authenticationRepository.checkTokenAvailability).toHaveBeenCalledWith('refresh-token');
    expect(tokenManager.generateAccessToken).toHaveBeenCalledWith({ id: 'user-1' });
  });

  it('does not check the repository when refresh-token verification fails', async () => {
    const context = createUseCase();
    const error = new Error('invalid token');
    context.tokenManager.verifyRefreshToken.mockImplementation(() => { throw error; });

    await expect(context.useCase.refreshAccessToken('bad-token')).rejects.toBe(error);
    expect(context.authenticationRepository.checkTokenAvailability).not.toHaveBeenCalled();
    expect(context.tokenManager.generateAccessToken).not.toHaveBeenCalled();
  });

  it('does not issue an access token when the refresh token is not stored', async () => {
    const context = createUseCase();
    const error = new Error('token not found');
    context.authenticationRepository.checkTokenAvailability.mockRejectedValue(error);

    await expect(context.useCase.refreshAccessToken('refresh-token')).rejects.toBe(error);
    expect(context.tokenManager.generateAccessToken).not.toHaveBeenCalled();
  });

  it('checks and removes a refresh token on logout', async () => {
    const { useCase, authenticationRepository } = createUseCase();

    await expect(useCase.logout('refresh-token')).resolves.toBeUndefined();
    expect(authenticationRepository.checkTokenAvailability).toHaveBeenCalledWith('refresh-token');
    expect(authenticationRepository.deleteToken).toHaveBeenCalledWith('refresh-token');
  });

  it('does not remove a refresh token when it is unavailable', async () => {
    const context = createUseCase();
    context.authenticationRepository.checkTokenAvailability.mockRejectedValue(new Error('not found'));

    await expect(context.useCase.logout('missing-token')).rejects.toThrow('not found');
    expect(context.authenticationRepository.deleteToken).not.toHaveBeenCalled();
  });
});
