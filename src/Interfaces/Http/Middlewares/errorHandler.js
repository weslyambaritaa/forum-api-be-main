const ClientError = require('../../../Commons/Exceptions/ClientError');
const AuthenticationError = require('../../../Commons/Exceptions/AuthenticationError');

/* eslint-disable no-unused-vars */
const errorHandler = (err, req, res, next) => {
  if (err instanceof ClientError || err instanceof AuthenticationError) {
    return res.status(err.statusCode).json({
      status: 'fail',
      message: err.message,
    });
  }

  // Unexpected / server error
  console.error(err);
  return res.status(500).json({
    status: 'error',
    message: 'terjadi kegagalan pada server kami',
  });
};

module.exports = errorHandler;
