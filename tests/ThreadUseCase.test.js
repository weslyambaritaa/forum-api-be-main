const ThreadUseCase = require('../src/Applications/UseCases/ThreadUseCase');

describe('ThreadUseCase', () => {
  it('adds a thread through the repository and returns its result', async () => {
    const thread = { id: 'thread-1', title: 'Title', owner: 'user-1' };
    const repository = { addThread: jest.fn().mockResolvedValue(thread) };
    const useCase = new ThreadUseCase(repository);

    await expect(useCase.addThread({ title: 'Title', body: 'Body', owner: 'user-1' })).resolves.toBe(thread);
    expect(repository.addThread).toHaveBeenCalledWith({ title: 'Title', body: 'Body', owner: 'user-1' });
  });

  it('verifies a thread before returning its detail', async () => {
    const thread = { id: 'thread-1' };
    const repository = {
      verifyThreadExists: jest.fn().mockResolvedValue(),
      getThreadById: jest.fn().mockResolvedValue(thread),
    };
    const useCase = new ThreadUseCase(repository);

    await expect(useCase.getThreadById('thread-1')).resolves.toBe(thread);
    expect(repository.verifyThreadExists).toHaveBeenCalledWith('thread-1');
    expect(repository.getThreadById).toHaveBeenCalledWith('thread-1');
  });

  it('does not fetch detail when the thread does not exist', async () => {
    const error = new Error('thread missing');
    const repository = {
      verifyThreadExists: jest.fn().mockRejectedValue(error),
      getThreadById: jest.fn(),
    };
    const useCase = new ThreadUseCase(repository);

    await expect(useCase.getThreadById('missing')).rejects.toBe(error);
    expect(repository.getThreadById).not.toHaveBeenCalled();
  });
});
