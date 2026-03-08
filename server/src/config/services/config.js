"use strict";

const fs = require("fs");
const path = require("path");

const env = process.env.NODE_ENV || "development";
const basePath = path.join(__dirname, "../../../../");
const envPath = path.join(basePath, `.env/${env}.config.env`);

const envConfig = require("dotenv").config({ path: envPath });
if (envConfig.error) {
  throw envConfig.error;
}

const sslOptions = {
  key: fs.readFileSync(path.join(basePath, `ssl/${process.env.SSL_KEY || "server.key"}`)),
  cert: fs.readFileSync(path.join(basePath, `ssl/${process.env.SSL_CRT || "server.crt"}`)),
};

const config = {
  env,
  ip: process.env.IP || "0.0.0.0",
  host: process.env.HOST || "localhost",
  port: parseInt(process.env.PORT || "8080", 10),
  prodHost: process.env.PROD_HOST || "localhost",
  url:
    env === "production"
      ? `https://${process.env.PROD_HOST}`
      : `https://${process.env.CLIENT_HOST || "localhost"}:${process.env.PORT || "8080"}`,
  sslOptions,
  clientBuildFolder: path.join(basePath, "./client"),
  clientStaticFolder: path.join(basePath, "./client/static"),
  nvidiaApiKey: process.env.NVIDIA_API_KEY || "",
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || "120", 10),
  maxPeersPerRoom: parseInt(process.env.MAX_PEERS_PER_ROOM || "10", 10),
};

module.exports = config;
