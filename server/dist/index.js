"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const constants_1 = require("./config/constants");
const logging_1 = __importDefault(require("./config/logging"));
const config_1 = __importDefault(require("./config/config"));
require("./config/passport");
const passport_1 = __importDefault(require("passport"));
const jwt = require('jsonwebtoken');
const main = () => {
    const app = (0, express_1.default)();
    const httpServer = http_1.default.createServer(app);
    app.use((req, res, next) => {
        logging_1.default.info(`METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);
        res.on("finish", () => {
            logging_1.default.info(`METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`);
        });
        next();
    });
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", req.header("origin"));
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
        res.header("Access-Control-Allow-Credentials", "true");
        if (req.method == "OPTIONS") {
            res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
            return res.status(200).json({});
        }
        next();
    });
    app.use(passport_1.default.initialize());
    app.use(express_1.default.urlencoded({ extended: false }));
    app.use(express_1.default.json());
    app.get("/login/:email", passport_1.default.authenticate("saml", config_1.default.saml.options));
    app.post("/login/callback", passport_1.default.authenticate("saml", config_1.default.saml.options), (_req, res, _next) => {
        var payload = _req === null || _req === void 0 ? void 0 : _req.user;
        var token = jwt.sign(payload, 'config.jwtSecret');
        return res.redirect(`http://localhost:3000/?token=${token}`);
    });
    app.get("/me", (req, res, _next) => {
        const token = req.get('Authorization');
        try {
            const user = jwt.verify(token, 'config.jwtSecret');
            logging_1.default.info("User is authenticated", user);
            logging_1.default.info(user);
            return res.status(200).json({ user });
        }
        catch (err) {
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
    httpServer.listen(constants_1.EXPRESS_PORT, () => logging_1.default.info(`Server is running on port ${constants_1.EXPRESS_PORT}`));
};
main();
//# sourceMappingURL=index.js.map