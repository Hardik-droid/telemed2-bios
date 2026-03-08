"use strict";

const apiRouter = require("./api");
const homeRoute = require("./home");
const show = require("../src/config/services/logging");

const init = (app) => {
  show.info("Initialising routes");

  // API routes
  app.use("/api", apiRouter);

  // SPA fallback — all other routes render index.html
  app.use("*", homeRoute);
};

module.exports = { init };
