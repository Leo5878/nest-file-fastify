"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesInterceptor = FilesInterceptor;
const rxjs_1 = require("rxjs");
const common_1 = require("@nestjs/common");
const request_1 = require("../multipart/request");
const options_1 = require("../multipart/options");
const multiple_files_1 = require("../multipart/handlers/multiple-files");
function FilesInterceptor(fieldname, maxCount = 1, options) {
    class MixinInterceptor {
        constructor() {
            this.options = (0, options_1.transformUploadOptions)(options);
        }
        async intercept(context, next) {
            const ctx = context.switchToHttp();
            const req = (0, request_1.getMultipartRequest)(ctx);
            const { body, files, remove } = await (0, multiple_files_1.handleMultipartMultipleFiles)(req, fieldname, maxCount, this.options);
            req.body = body;
            req.storageFiles = files;
            return next.handle().pipe((0, rxjs_1.tap)(remove));
        }
    }
    const Interceptor = (0, common_1.mixin)(MixinInterceptor);
    return Interceptor;
}
//# sourceMappingURL=files-interceptor.js.map