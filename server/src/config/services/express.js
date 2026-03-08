"use strict";

const config = require("./config");
const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const show = require("./logging");

const init = () => {
  const app = express();

  // Security headers — relaxed CSP for CDN assets used in the UI
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "cdn.tailwindcss.com",
            "cdn.socket.io",
            "cdnjs.cloudflare.com",
            "fonts.googleapis.com",
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "cdn.tailwindcss.com",
            "cdnjs.cloudflare.com",
            "fonts.googleapis.com",
          ],
          fontSrc: ["'self'", "fonts.googleapis.com", "fonts.gstatic.com", "cdnjs.cloudflare.com"],
          imgSrc: ["'self'", "data:", "blob:"],
          mediaSrc: ["'self'", "blob:"],
          connectSrc: ["'self'", "wss:", "ws:", "https://cdn.socket.io", "https://integrate.api.nvidia.com"],
        },
      },
      crossOriginOpenerPolicy: false,
    })
  );

  // CORS
  const corsOptions = {
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  };
  app.use(cors(corsOptions));

  // Body parsing
  app.use(bodyParser.json({ limit: "1mb" }));
  app.use(bodyParser.urlencoded({ extended: true, limit: "1mb" }));

  // HTTP request logging
  app.use(
    morgan("combined", {
      stream: { write: (msg) => show.info(msg.trim()) },
      skip: (req) => req.url === "/health",
    })
  );

  // Global rate limiter
  app.use(
    rateLimit({
      windowMs: config.rateLimitWindowMs,
      max: config.rateLimitMax,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: "Too many requests, please try again later." },
    })
  );

  // Stricter rate limiter for AI endpoints
  app.use(
    "/api/ai",
    rateLimit({
      windowMs: 60 * 1000,
      max: 20,
      message: { error: "AI rate limit exceeded. Please wait before sending more requests." },
    })
  );

  // Static files
  app.use(express.static(config.clientBuildFolder));

  // View engine (serves client/index.html as the SPA entry point)
  app.set("views", config.clientBuildFolder);
  app.engine("html", require("ejs").renderFile);
  app.set("view engine", "html");

  return app;
};

module.exports = { init };
