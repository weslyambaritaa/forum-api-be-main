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
});
