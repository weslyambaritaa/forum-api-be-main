const pool = require('../src/Infrastructures/Database/postgresPool');
const PostgresThreadRepository = require('../src/Infrastructures/Repositories/PostgresThreadRepository');
const NotFoundError = require('../src/Commons/Exceptions/NotFoundError');

describe('PostgresThreadRepository integration', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('checks thread existence against PostgreSQL', async () => {
    const repository = new PostgresThreadRepository(pool);

    await expect(repository.verifyThreadExists('thread-does-not-exist'))
      .rejects.toBeInstanceOf(NotFoundError);
  });
});
