"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterUpload = void 0;
const common_1 = require("@nestjs/common");
const filterUpload = async (uploadOptions, req, file) => {
    if (uploadOptions.filter == null) {
        return true;
    }
    try {
        const res = await uploadOptions.filter(req, file);
        if (typeof res === "string") {
            throw new common_1.BadRequestException(res);
        }
        return res;
    }
    catch (error) {
        await uploadOptions.storage.removeFile(file, true);
        throw error;
    }
};
exports.filterUpload = filterUpload;
//# sourceMappingURL=filter.js.map