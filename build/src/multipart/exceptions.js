"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformException = void 0;
const common_1 = require("@nestjs/common");
const transformException = (err) => {
    if (!err || err instanceof common_1.HttpException) {
        return err;
    }
    const code = err.code;
    switch (code) {
        case "FST_REQ_FILE_TOO_LARGE":
            return new common_1.PayloadTooLargeException();
        case "FST_PARTS_LIMIT":
        case "FST_FILES_LIMIT":
        case "FST_PROTO_VIOLATION":
        case "FST_INVALID_MULTIPART_CONTENT_TYPE":
            return new common_1.BadRequestException(err.message);
    }
    return err;
};
exports.transformException = transformException;
//# sourceMappingURL=exceptions.js.map