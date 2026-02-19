"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMultipartMultipleFiles = void 0;
const common_1 = require("@nestjs/common");
const file_1 = require("../file");
const request_1 = require("../request");
const filter_1 = require("../filter");
const handleMultipartMultipleFiles = async (req, fieldname, maxCount, options) => {
    const parts = (0, request_1.getParts)(req, options);
    const body = {};
    const files = [];
    const removeFiles = async (error) => {
        return await (0, file_1.removeStorageFiles)(options.storage, files, error);
    };
    try {
        for await (const part of parts) {
            if (part.file) {
                if (part.fieldname !== fieldname) {
                    throw new common_1.BadRequestException(`Field ${part.fieldname} doesn't accept files`);
                }
                if (files.length + 1 > maxCount) {
                    throw new common_1.BadRequestException(`Field ${part.fieldname} accepts max ${maxCount} files`);
                }
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
        await removeFiles(error);
        throw error;
    }
    return { body, files, remove: () => removeFiles() };
};
exports.handleMultipartMultipleFiles = handleMultipartMultipleFiles;
//# sourceMappingURL=multiple-files.js.map