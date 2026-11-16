const bcrypt = require('bcrypt');
const AuthenticationError = require('../src/Commons/Exceptions/AuthenticationError');
const InvariantError = require('../src/Commons/Exceptions/InvariantError');
const AuthenticationUseCase = require('../src/Applications/UseCases/AuthenticationUseCase');
const password = require('../src/Infrastructures/Security/password');
const tokenManager = require('../src/Infrastructures/Security/token');

describe('authentication error handling', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws AuthenticationError when the password does not match', async () => {
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

    await expect(password.compare('wrong-password', 'hashed-password'))
      .rejects.toBeInstanceOf(AuthenticationError);
  });

  it('rejects an invalid refresh token before checking the token repository', async () => {
    const authenticationRepository = {
      checkTokenAvailability: jest.fn(),
    };
    const authenticationUseCase = new AuthenticationUseCase(
      null, authenticationRepository, null, tokenManager
    );

    await expect(authenticationUseCase.refreshAccessToken('invalid-token'))
      .rejects.toThrow(new InvariantError('refresh token tidak valid'));
    expect(authenticationRepository.checkTokenAvailability).not.toHaveBeenCalled();
  });

  it('throws InvariantError when user is not found during getPasswordByUsername', async () => {
    const fakePool = {
      query: jest.fn().mockResolvedValue({ rowCount: 0, rows: [] }),
    };
    const PostgresUserRepository = require('../src/Infrastructures/Repositories/PostgresUserRepository');
    const userRepository = new PostgresUserRepository(fakePool);

    await expect(userRepository.getPasswordByUsername('nonexistent_user'))
      .rejects.toMatchObject({
        name: 'InvariantError',
        statusCode: 400,
        message: 'username tidak ditemukan',
      });
  });

  it('returns the expected error when logout token is not found in database', async () => {
    const fakePool = {
      query: jest.fn().mockResolvedValue({ rowCount: 0, rows: [] }),
    };
    const PostgresAuthenticationRepository = require('../src/Infrastructures/Repositories/PostgresAuthenticationRepository');
    const authenticationRepository = new PostgresAuthenticationRepository(fakePool);
    const authenticationUseCase = new AuthenticationUseCase(null, authenticationRepository, null, null);

    await expect(authenticationUseCase.logout('invalid-refresh-token'))
      .rejects.toMatchObject({
        name: 'InvariantError',
        statusCode: 400,
        message: 'refresh token tidak ditemukan di database',
      });
  });
});
