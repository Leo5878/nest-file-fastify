"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParts = exports.getMultipartRequest = void 0;
const common_1 = require("@nestjs/common");
const getMultipartRequest = (ctx) => {
    const req = ctx.getRequest();
    if (!req.isMultipart()) {
        throw new common_1.BadRequestException("Not a multipart request");
    }
    return req;
};
exports.getMultipartRequest = getMultipartRequest;
const getParts = (req, options) => {
    return req.parts(options);
};
exports.getParts = getParts;
//# sourceMappingURL=request.js.map