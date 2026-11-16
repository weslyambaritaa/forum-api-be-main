require('dotenv').config();
const container = require('./Infrastructures/container');
const createServer = require('./Interfaces/Http/createServer');

const server = createServer(container);
const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 5000;

server.listen(port, host, () => {
  console.log(`Forum API running at http://${host}:${port}`);
});
