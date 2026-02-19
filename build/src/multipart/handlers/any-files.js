"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMultipartAnyFiles = void 0;
const request_1 = require("../request");
const file_1 = require("../file");
const filter_1 = require("../filter");
const handleMultipartAnyFiles = async (req, options) => {
    const parts = (0, request_1.getParts)(req, options);
    const body = {};
    const files = [];
    const removeFiles = async (error) => {
        return await (0, file_1.removeStorageFiles)(options.storage, files, error);
    };
    try {
        for await (const part of parts) {
            if (part.file) {
                const file = await options.storage.handleFile(part, req);
                if (await (0, filter_1.filterUpload)(options, req, file)) {
                    files.push(file);
                }
            }
            else {
                body[part.fieldname] = part.value;
            }
        }
    }
    catch (error) {
        await removeFiles(true);
        throw error;
    }
    return { body, files, remove: () => removeFiles() };
};
exports.handleMultipartAnyFiles = handleMultipartAnyFiles;
//# sourceMappingURL=any-files.js.map