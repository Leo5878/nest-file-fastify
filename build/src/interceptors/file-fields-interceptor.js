"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileFieldsInterceptor = FileFieldsInterceptor;
const rxjs_1 = require("rxjs");
const common_1 = require("@nestjs/common");
const request_1 = require("../multipart/request");
const options_1 = require("../multipart/options");
const file_fields_1 = require("../multipart/handlers/file-fields");
function FileFieldsInterceptor(uploadFields, options) {
    class MixinInterceptor {
        constructor() {
            this.options = (0, options_1.transformUploadOptions)(options);
            this.fieldsMap = (0, file_fields_1.uploadFieldsToMap)(uploadFields);
        }
        async intercept(context, next) {
            const ctx = context.switchToHttp();
            const req = (0, request_1.getMultipartRequest)(ctx);
            const { body, files, remove } = await (0, file_fields_1.handleMultipartFileFields)(req, this.fieldsMap, this.options);
            req.body = body;
            req.storageFiles = files;
            return next.handle().pipe((0, rxjs_1.tap)(remove));
        }
    }
    const Interceptor = (0, common_1.mixin)(MixinInterceptor);
    return Interceptor;
}
//# sourceMappingURL=file-fields-interceptor.js.map