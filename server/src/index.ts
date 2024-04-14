import express from "express";
import http from "http";
import { EXPRESS_PORT } from "./config/constants";
import logging from "./config/logging";
import config from "./config/config";
import "./config/passport";
import passport from "passport";
const jwt = require('jsonwebtoken');

const main = () => {
  const app = express();

  const httpServer = http.createServer(app);

  app.use((req, res, next) => {
    logging.info(
      `METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`
    );

    res.on("finish", () => {
      logging.info(
        `METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`
      );
    });

    next();
  });

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.header("origin"));
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header("Access-Control-Allow-Credentials", "true");

    if (req.method == "OPTIONS") {
      res.header(
        "Access-Control-Allow-Methods",
        "PUT, POST, PATCH, DELETE, GET"
      );
      return res.status(200).json({});
    }

    next();
  });

  /** Parse request body */
  app.use(passport.initialize());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  /** Endpoint to authenticate by saml provider using Passport */
  app.get("/login/:email", passport.authenticate("saml", config.saml.options));

  /** Endpoint called by saml provider using Passport */
  app.post(
    "/login/callback",
    passport.authenticate("saml", config.saml.options),
    (_req, res, _next) => {
      var payload = _req?.user;
      var token = jwt.sign(payload, 'config.jwtSecret');
      return res.redirect(`http://localhost:3000/?token=${token}`);
    }
  );

  /** Check for user authentication
   * If user authenticated return user
   */
  app.get("/me", (req, res, _next) => {
    const token = req.get('Authorization')
    try {
      const user = jwt.verify(token, 'config.jwtSecret');
      logging.info("User is authenticated", user);
      logging.info(user);

      return res.status(200).json({ user });
  
    } catch (err) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
  });

  app.use((_req, res, _next) => {
    const error = new Error("404 Not found");

    res.status(404).json({
      message: error.message,
    });
  });

  httpServer.listen(EXPRESS_PORT, () =>
    logging.info(`Server is running on port ${EXPRESS_PORT}`)
  );
};

main();
