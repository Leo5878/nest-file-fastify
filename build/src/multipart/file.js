"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeStorageFiles = void 0;
const removeStorageFiles = async (storage, files, force) => {
    if (files == null)
        return;
    await Promise.all(files.map((file) => file && storage.removeFile(file, force)));
};
exports.removeStorageFiles = removeStorageFiles;
//# sourceMappingURL=file.js.map