import fs from "fs";
import passport from "passport";
import { MultiSamlStrategy } from "passport-saml";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { findIndex } from "lodash";
import config from "./config";
import logging from "./logging";
import { getEmailDomain } from "../utils";

const Saml2js = require('saml2js');

const users: Express.User[] = [];

passport.serializeUser<Express.User>((user, done) => {
  logging.info(user, "serializeUser");
  done(null, user);
});

passport.deserializeUser<Express.User>((user, done) => {
  logging.info(user, "DeserializeUser");
  done(null, user);
});

const getSamlOptions = (request: any, done: any) => {
  try {
    let { email } = request.params;

    if (request.body.SAMLResponse) {
      const parser = new Saml2js(request.body.SAMLResponse);
      const samlResponse = parser.toObject();
      email = samlResponse.email
    }
    const domain = getEmailDomain(email);
    const config = samlConfigs[domain];
    done(null, config || {});
  } catch (err) {
    logging.error(err, "getSamlOptions");
  }
};

const multiSamlStrategy = new MultiSamlStrategy(
  {
    passReqToCallback: true, // makes req available in callback
    getSamlOptions,
  },
  (req: any, user: any, done: any) => {
    if (!users.includes(user)) {
      users.push(user);
    }
    return done(null, user);
  }
);

const jwtSamlStrategy = new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'config.jwtSecret'
}, function(jwt_payload, next) {
  // TODO use DB here
  var user = users[findIndex(users, {id: jwt_payload.id})];
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
});

passport.use(multiSamlStrategy);
passport.use(jwtSamlStrategy);

const samlConfigs = {
  'lassecurity': {
    entryPoint: config.saml.entryPoint,
    issuer: config.saml.issuer,
    callbackUrl: config.saml.callbackUrl,
    cert: fs.readFileSync(config.saml.cert, "utf-8"),
  }
} as any;
