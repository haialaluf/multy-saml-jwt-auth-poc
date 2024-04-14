"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmailDomain = void 0;
const getEmailDomain = (email) => {
    if (!email)
        return '';
    return email === null || email === void 0 ? void 0 : email.split('@')[1].split('.')[0];
};
exports.getEmailDomain = getEmailDomain;
//# sourceMappingURL=utils.js.map