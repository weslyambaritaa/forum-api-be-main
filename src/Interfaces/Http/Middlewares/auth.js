const AuthenticationError = require('../../../Commons/Exceptions/AuthenticationError');

/**
 * Verifies the Bearer access token on the Authorization header and attaches
 * the decoded payload (containing the user id) to req.auth.credentials.
 */
const createAuthenticate = (tokenManager) => (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AuthenticationError('Missing authentication'));
  }

  const accessToken = authHeader.slice('Bearer '.length);

  try {
    const decoded = tokenManager.verifyAccessToken(accessToken);
    req.auth = { credentials: { id: decoded.id } };
    return next();
  } catch (error) {
    return next(new AuthenticationError('Missing authentication'));
  }
};

module.exports = createAuthenticate;
