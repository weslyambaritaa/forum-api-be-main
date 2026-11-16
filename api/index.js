// Vercel serverless entrypoint. Vercel treats any file under /api that
// exports a request handler as a function; Express apps work directly here
// since `app` itself is a valid (req, res) handler.
require('dotenv').config();
const container = require('../src/Infrastructures/container');
const createServer = require('../src/Interfaces/Http/createServer');

const app = createServer(container);

module.exports = app;
