"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const config = {
    saml: {
        cert: "./src/config/saml.pem",
        entryPoint: 'https://accounts.google.com/o/saml2/idp?idpid=C01jn9yh8',
        issuer: 'https://accounts.google.com/o/saml2?idpid=C01jn9yh8',
        callbackUrl: 'https://woodcock-more-arguably.ngrok-free.app/login/callback',
        options: {
            faliureFlash: true,
            failureRedirect: "/login",
        },
    },
    server: {
        port: constants_1.EXPRESS_PORT,
    }
};
exports.default = config;
//# sourceMappingURL=config.js.map