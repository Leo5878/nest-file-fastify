"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMultipartSingleFile = void 0;
const common_1 = require("@nestjs/common");
const request_1 = require("../request");
const filter_1 = require("../filter");
const handleMultipartSingleFile = async (req, fieldname, options) => {
    const parts = (0, request_1.getParts)(req, options);
    const body = {};
    let file = undefined;
    const removeFiles = async (error) => {
        if (file == null)
            return;
        await options.storage.removeFile(file, error);
    };
    try {
        for await (const part of parts) {
            if (part.file) {
                if (part.fieldname !== fieldname) {
                    throw new common_1.BadRequestException(`Field ${part.fieldname} doesn't accept file`);
                }
                else if (file != null) {
                    throw new common_1.BadRequestException(`Field ${fieldname} accepts only one file`);
                }
                const _file = await options.storage.handleFile(part, req);
                if (await (0, filter_1.filterUpload)(options, req, _file)) {
                    file = _file;
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
        file,
        remove: () => removeFiles(),
    };
};
exports.handleMultipartSingleFile = handleMultipartSingleFile;
//# sourceMappingURL=single-file.js.map