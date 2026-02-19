"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiskStorage = void 0;
const os_1 = require("os");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const fs_2 = require("../fs");
const promises_2 = require("stream/promises");
const excecuteStorageHandler = (file, req, obj) => {
    if (typeof obj === "function") {
        return obj(file, req);
    }
    if (obj != null)
        return obj;
    return null;
};
const ENV_TESTS_STORAGE_TMP_PATH = process.env.__TESTS_TMP_PATH__;
class DiskStorage {
    constructor(options) {
        this.options = options;
        if (ENV_TESTS_STORAGE_TMP_PATH != null) {
            this.options = { ...this.options, dest: ENV_TESTS_STORAGE_TMP_PATH };
        }
    }
    async handleFile(file, req) {
        const filename = await this.getFilename(file, req, this.options?.filename);
        const dest = await this.getFileDestination(file, req, this.options?.dest);
        if (!(await (0, fs_2.pathExists)(dest))) {
            await (0, promises_1.mkdir)(dest, { recursive: true });
        }
        const path = (0, path_1.join)(dest, filename);
        const stream = (0, fs_1.createWriteStream)(path);
        await (0, promises_2.pipeline)(file.file, stream);
        const { encoding, fieldname, mimetype } = file;
        return {
            size: stream.bytesWritten,
            dest,
            filename,
            originalFilename: file.filename,
            path,
            mimetype,
            encoding,
            fieldname,
        };
    }
    async removeFile(file, force) {
        if (!this.options?.removeAfter && !force)
            return;
        await (0, promises_1.unlink)(file.path);
    }
    async getFilename(file, req, obj) {
        return (excecuteStorageHandler(file, req, obj) ?? (0, fs_2.getUniqueFilename)(file.filename));
    }
    async getFileDestination(file, req, obj) {
        return excecuteStorageHandler(file, req, obj) ?? (0, os_1.tmpdir)();
    }
}
exports.DiskStorage = DiskStorage;
//# sourceMappingURL=disk-storage.js.map