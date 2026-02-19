"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileInterceptor = FileInterceptor;
const rxjs_1 = require("rxjs");
const common_1 = require("@nestjs/common");
const request_1 = require("../multipart/request");
const options_1 = require("../multipart/options");
const single_file_1 = require("../multipart/handlers/single-file");
function FileInterceptor(fieldname, options) {
    class MixinInterceptor {
        constructor() {
            this.options = (0, options_1.transformUploadOptions)(options);
        }
        async intercept(context, next) {
            const ctx = context.switchToHttp();
            const req = (0, request_1.getMultipartRequest)(ctx);
            const { file, body, remove } = await (0, single_file_1.handleMultipartSingleFile)(req, fieldname, this.options);
            req.body = body;
            req.storageFile = file;
            return next.handle().pipe((0, rxjs_1.tap)(remove));
        }
    }
    const Interceptor = (0, common_1.mixin)(MixinInterceptor);
    return Interceptor;
}
//# sourceMappingURL=file-interceptor.js.map