const InvariantError = require('../../../Commons/Exceptions/InvariantError');

const validatePostAuthenticationPayload = (payload) => {
  const { username, password } = payload || {};
  if (!username || !password) {
    throw new InvariantError('harus mengirimkan username dan password');
  }
  if (typeof username !== 'string' || typeof password !== 'string') {
    throw new InvariantError('username dan password harus string');
  }
};

const validateRefreshTokenPayload = (payload) => {
  const { refreshToken } = payload || {};
  if (!refreshToken) {
    throw new InvariantError('harus mengirimkan token refresh');
  }
  if (typeof refreshToken !== 'string') {
    throw new InvariantError('refresh token harus string');
  }
};

const validatePutAuthenticationPayload = (payload) => validateRefreshTokenPayload(payload);
const validateDeleteAuthenticationPayload = (payload) => validateRefreshTokenPayload(payload);

module.exports = {
  validatePostAuthenticationPayload,
  validatePutAuthenticationPayload,
  validateDeleteAuthenticationPayload,
};
