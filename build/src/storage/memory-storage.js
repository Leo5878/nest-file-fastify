"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryStorage = void 0;
const fs_1 = require("../fs");
class MemoryStorage {
    async handleFile(file, req) {
        const buffer = await file.toBuffer();
        const filename = await (0, fs_1.getUniqueFilename)(file.filename);
        const { encoding, mimetype, fieldname } = file;
        return {
            buffer,
            size: buffer.length,
            encoding,
            mimetype,
            fieldname,
            filename,
            originalFilename: file.filename,
        };
    }
    async removeFile(file) {
        delete file.buffer;
    }
}
exports.MemoryStorage = MemoryStorage;
//# sourceMappingURL=memory-storage.js.map