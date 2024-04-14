"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const passport_1 = __importDefault(require("passport"));
const passport_saml_1 = require("passport-saml");
const passport_jwt_1 = require("passport-jwt");
const lodash_1 = require("lodash");
const config_1 = __importDefault(require("./config"));
const logging_1 = __importDefault(require("./logging"));
const utils_1 = require("../utils");
const Saml2js = require('saml2js');
const users = [];
passport_1.default.serializeUser((user, done) => {
    logging_1.default.info(user, "serializeUser");
    done(null, user);
});
passport_1.default.deserializeUser((user, done) => {
    logging_1.default.info(user, "DeserializeUser");
    done(null, user);
});
const getSamlOptions = (request, done) => {
    try {
        let { email } = request.params;
        if (request.body.SAMLResponse) {
            const parser = new Saml2js(request.body.SAMLResponse);
            const samlResponse = parser.toObject();
            email = samlResponse.email;
        }
        const domain = (0, utils_1.getEmailDomain)(email);
        const config = samlConfigs[domain];
        done(null, config || {});
    }
    catch (err) {
        logging_1.default.error(err, "getSamlOptions");
    }
};
const multiSamlStrategy = new passport_saml_1.MultiSamlStrategy({
    passReqToCallback: true,
    getSamlOptions,
}, (req, user, done) => {
    if (!users.includes(user)) {
        users.push(user);
    }
    return done(null, user);
});
const jwtSamlStrategy = new passport_jwt_1.Strategy({
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'config.jwtSecret'
}, function (jwt_payload, next) {
    var user = users[(0, lodash_1.findIndex)(users, { id: jwt_payload.id })];
    if (user) {
        next(null, user);
    }
    else {
        next(null, false);
    }
});
passport_1.default.use(multiSamlStrategy);
passport_1.default.use(jwtSamlStrategy);
const samlConfigs = {
    'lassecurity': {
        entryPoint: config_1.default.saml.entryPoint,
        issuer: config_1.default.saml.issuer,
        callbackUrl: config_1.default.saml.callbackUrl,
        cert: fs_1.default.readFileSync(config_1.default.saml.cert, "utf-8"),
    }
};
//# sourceMappingURL=passport.js.map