"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformUploadOptions = exports.DEFAULT_UPLOAD_OPTIONS = void 0;
const storage_1 = require("../storage");
exports.DEFAULT_UPLOAD_OPTIONS = {
    storage: new storage_1.MemoryStorage(),
};
const transformUploadOptions = (opts) => {
    if (opts == null)
        return exports.DEFAULT_UPLOAD_OPTIONS;
    if (opts.dest != null) {
        return {
            ...opts,
            storage: new storage_1.DiskStorage({
                dest: opts.dest,
                ...opts.storage?.options,
            }),
        };
    }
    return { ...exports.DEFAULT_UPLOAD_OPTIONS, ...opts };
};
exports.transformUploadOptions = transformUploadOptions;
//# sourceMappingURL=options.js.map