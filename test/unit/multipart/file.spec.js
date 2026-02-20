"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const file_1 = require("../../../src/multipart/file");
const memory_storage_1 = require("../../../src/storage/memory-storage");
const helpers_1 = require("../../helpers");
function buildStorage() {
    return new memory_storage_1.MemoryStorage();
}
async function storeFile(storage) {
    const part = (0, helpers_1.createMockFilePart)({ fieldname: "file", filename: "test.txt" });
    const req = (0, helpers_1.createMockRequest)();
    return storage.handleFile(part, req);
}
describe("removeStorageFiles", () => {
    it("should return early without error when files is undefined", async () => {
        const storage = buildStorage();
        await expect((0, file_1.removeStorageFiles)(storage, undefined)).resolves.toBeUndefined();
    });
    it("should return early without error when files is null", async () => {
        const storage = buildStorage();
        await expect((0, file_1.removeStorageFiles)(storage, null)).resolves.toBeUndefined();
    });
    it("should remove all provided files", async () => {
        const storage = buildStorage();
        const file1 = await storeFile(storage);
        const file2 = await storeFile(storage);
        const removeSpy = jest.spyOn(storage, "removeFile");
        await (0, file_1.removeStorageFiles)(storage, [file1, file2], true);
        expect(removeSpy).toHaveBeenCalledTimes(2);
        expect(removeSpy).toHaveBeenCalledWith(file1, true);
        expect(removeSpy).toHaveBeenCalledWith(file2, true);
    });
    it("should skip undefined entries in the files array", async () => {
        const storage = buildStorage();
        const file = await storeFile(storage);
        const removeSpy = jest.spyOn(storage, "removeFile");
        await (0, file_1.removeStorageFiles)(storage, [file, undefined], true);
        expect(removeSpy).toHaveBeenCalledTimes(1);
        expect(removeSpy).toHaveBeenCalledWith(file, true);
    });
    it("should call removeFile without force flag by default", async () => {
        const storage = buildStorage();
        const file = await storeFile(storage);
        const removeSpy = jest.spyOn(storage, "removeFile");
        await (0, file_1.removeStorageFiles)(storage, [file]);
        expect(removeSpy).toHaveBeenCalledWith(file, undefined);
    });
});
//# sourceMappingURL=file.spec.js.map