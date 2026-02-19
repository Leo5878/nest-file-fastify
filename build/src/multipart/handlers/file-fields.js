"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMultipartFileFields = exports.uploadFieldsToMap = void 0;
const common_1 = require("@nestjs/common");
const request_1 = require("../request");
const file_1 = require("../file");
const filter_1 = require("../filter");
const uploadFieldsToMap = (uploadFields) => {
    const map = new Map();
    uploadFields.forEach(({ name, ...opts }) => {
        map.set(name, { maxCount: 1, ...opts });
    });
    return map;
};
exports.uploadFieldsToMap = uploadFieldsToMap;
const handleMultipartFileFields = async (req, fieldsMap, options) => {
    const parts = (0, request_1.getParts)(req, options);
    const body = {};
    const files = {};
    const removeFiles = async (error) => {
        const allFiles = [].concat(...Object.values(files));
        return await (0, file_1.removeStorageFiles)(options.storage, allFiles, error);
    };
    try {
        for await (const part of parts) {
            if (part.file) {
                const fieldOptions = fieldsMap.get(part.fieldname);
                if (fieldOptions == null) {
                    throw new common_1.BadRequestException(`Field ${part.fieldname} doesn't accept files`);
                }
                if (files[part.fieldname] == null) {
                    files[part.fieldname] = [];
                }
                if (files[part.fieldname].length + 1 > fieldOptions.maxCount) {
                    throw new common_1.BadRequestException(`Field ${part.fieldname} accepts max ${fieldOptions.maxCount} files`);
                }
                const file = await options.storage.handleFile(part, req);
                if (await (0, filter_1.filterUpload)(options, req, file)) {
                    files[part.fieldname].push(file);
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
    return {
        body,
        files,
        remove: () => removeFiles(),
    };
};
exports.handleMultipartFileFields = handleMultipartFileFields;
//# sourceMappingURL=file-fields.js.map