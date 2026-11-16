const express = require('express');
const cors = require('cors');

const usersRoutes = require('./Api/Routes/users');
const authenticationsRoutes = require('./Api/Routes/authentications');
const threadsRoutes = require('./Api/Routes/threads');
const createAuthenticate = require('./Middlewares/auth');
const errorHandler = require('./Middlewares/errorHandler');
const notFoundHandler = require('./Middlewares/notFoundHandler');

const createServer = (dependencies) => {
  const app = express();
  const authenticate = createAuthenticate(dependencies.tokenManager);

  app.use(cors());
  app.use(express.json());

  app.get('/', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Forum API is up' });
  });

  app.use('/users', usersRoutes(dependencies));
  app.use('/authentications', authenticationsRoutes(dependencies));
  app.use('/threads', threadsRoutes({ ...dependencies, authenticate }));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

module.exports = createServer;
