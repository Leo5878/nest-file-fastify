"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnyFilesInterceptor = AnyFilesInterceptor;
const rxjs_1 = require("rxjs");
const common_1 = require("@nestjs/common");
const request_1 = require("../multipart/request");
const options_1 = require("../multipart/options");
const any_files_1 = require("../multipart/handlers/any-files");
function AnyFilesInterceptor(options) {
    class MixinInterceptor {
        constructor() {
            this.options = (0, options_1.transformUploadOptions)(options);
        }
        async intercept(context, next) {
            const ctx = context.switchToHttp();
            const req = (0, request_1.getMultipartRequest)(ctx);
            const { body, files, remove } = await (0, any_files_1.handleMultipartAnyFiles)(req, this.options);
            req.body = body;
            req.storageFiles = files;
            return next.handle().pipe((0, rxjs_1.tap)(remove));
        }
    }
    const Interceptor = (0, common_1.mixin)(MixinInterceptor);
    return Interceptor;
}
//# sourceMappingURL=any-files-interceptor.js.map