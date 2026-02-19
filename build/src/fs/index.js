"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUniqueFilename = exports.pathExists = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const crypto_1 = require("../crypto");
const pathExists = async (path) => {
    try {
        await fs_1.promises.stat(path);
    }
    catch (err) {
        return false;
    }
    return true;
};
exports.pathExists = pathExists;
const getUniqueFilename = async (filename) => {
    const buffer = await (0, crypto_1.randomBytes)(16);
    const ext = (0, path_1.extname)(filename);
    return buffer.toString("hex") + ext;
};
exports.getUniqueFilename = getUniqueFilename;
//# sourceMappingURL=index.js.map