"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadedFile = void 0;
const common_1 = require("@nestjs/common");
const request_1 = require("../multipart/request");
exports.UploadedFile = (0, common_1.createParamDecorator)(async (_data, ctx) => {
    const req = (0, request_1.getMultipartRequest)(ctx.switchToHttp());
    return req.storageFile;
});
//# sourceMappingURL=uploaded-file-decorator.js.map