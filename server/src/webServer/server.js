'use strict';

const { express, show, stats, config } = require('../config');
const https = require('https');
const http = require('http');
const { initSocketServer } = require('../lib');
const { Server } = require('socket.io');
const routes = require('../../routes');

let server = null;

const listen = () => {
  const app = express.init();

  // Use native https - spdy (HTTP/2) is deprecated on Node 22+
  server = https.createServer(config.sslOptions, app);
  server.listen(config.port, config.ip, () => {
    show.info('Listening at https://' + config.host + ':' + config.port);
  });

  server.on('error', (err) => {
    show.error('Server error: ' + err.message);
    process.exit(1);
  });

  const io = new Server(server, {
    cors: { origin: true, credentials: true },
    pingTimeout: 30000,
    pingInterval: 10000,
  });
  initSocketServer(io);
  routes.init(app);
  stats.memory();

  // Graceful shutdown
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

const shutdown = () => {
  show.info('Graceful shutdown initiated...');
  server.close(() => {
    show.info('Server closed.');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
};

const close = () => server && server.close();

module.exports = { listen, close };