"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomBytes = void 0;
const util_1 = require("util");
const crypto_1 = require("crypto");
exports.randomBytes = (0, util_1.promisify)(crypto_1.randomBytes);
//# sourceMappingURL=index.js.map