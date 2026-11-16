const AddUserUseCase = require('../src/Applications/UseCases/AddUserUseCase');

describe('AddUserUseCase', () => {
  it('hashes the password and delegates to the repository', async () => {
    const fakeUserRepository = {
      verifyUsernameAvailable: jest.fn().mockResolvedValue(),
      addUser: jest.fn().mockImplementation(({ username, password, fullname }) => Promise.resolve({
        id: 'user-123', username, fullname,
      })),
    };
    const passwordManager = {
      hash: jest.fn().mockResolvedValue('hashed-secret'),
    };

    const useCase = new AddUserUseCase(fakeUserRepository, passwordManager);
    const result = await useCase.addUser({
      username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia',
    });

    expect(fakeUserRepository.verifyUsernameAvailable).toHaveBeenCalledWith('dicoding');
    expect(passwordManager.hash).toHaveBeenCalledWith('secret');
    expect(fakeUserRepository.addUser).toHaveBeenCalled();
    const calledWith = fakeUserRepository.addUser.mock.calls[0][0];
    expect(calledWith.password).toEqual('hashed-secret');
    expect(result).toEqual({ id: 'user-123', username: 'dicoding', fullname: 'Dicoding Indonesia' });
  });

  it('does not hash or add a user when the username is unavailable', async () => {
    const error = new Error('username unavailable');
    const userRepository = {
      verifyUsernameAvailable: jest.fn().mockRejectedValue(error),
      addUser: jest.fn(),
    };
    const passwordManager = { hash: jest.fn() };
    const useCase = new AddUserUseCase(userRepository, passwordManager);

    await expect(useCase.addUser({ username: 'taken', password: 'secret', fullname: 'Name' })).rejects.toBe(error);
    expect(passwordManager.hash).not.toHaveBeenCalled();
    expect(userRepository.addUser).not.toHaveBeenCalled();
  });

  it('does not add a user when password hashing fails', async () => {
    const error = new Error('hash failed');
    const userRepository = {
      verifyUsernameAvailable: jest.fn().mockResolvedValue(),
      addUser: jest.fn(),
    };
    const passwordManager = { hash: jest.fn().mockRejectedValue(error) };
    const useCase = new AddUserUseCase(userRepository, passwordManager);

    await expect(useCase.addUser({ username: 'alice', password: 'secret', fullname: 'Name' })).rejects.toBe(error);
    expect(userRepository.addUser).not.toHaveBeenCalled();
  });
});
