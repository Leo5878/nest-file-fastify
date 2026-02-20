"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const options_1 = require("../../../src/multipart/options");
const memory_storage_1 = require("../../../src/storage/memory-storage");
const disk_storage_1 = require("../../../src/storage/disk-storage");
describe("transformUploadOptions", () => {
    it("should return default options when no options provided", () => {
        const result = (0, options_1.transformUploadOptions)();
        expect(result).toEqual(options_1.DEFAULT_UPLOAD_OPTIONS);
        expect(result.storage).toBeInstanceOf(memory_storage_1.MemoryStorage);
    });
    it("should return default options when undefined is passed", () => {
        const result = (0, options_1.transformUploadOptions)(undefined);
        expect(result.storage).toBeInstanceOf(memory_storage_1.MemoryStorage);
    });
    it("should create DiskStorage when dest is provided", () => {
        const result = (0, options_1.transformUploadOptions)({ dest: "/tmp/uploads" });
        expect(result.storage).toBeInstanceOf(disk_storage_1.DiskStorage);
    });
    it("should pass dest to DiskStorage options", () => {
        const result = (0, options_1.transformUploadOptions)({ dest: "/tmp/uploads" });
        expect(result.storage.options?.dest).toBe("/tmp/uploads");
    });
    it("should merge custom options with defaults when no dest", () => {
        const customStorage = new memory_storage_1.MemoryStorage();
        const result = (0, options_1.transformUploadOptions)({ storage: customStorage });
        expect(result.storage).toBe(customStorage);
    });
    it("should preserve busboy options like limits", () => {
        const result = (0, options_1.transformUploadOptions)({
            limits: { fileSize: 5 * 1024 * 1024 },
        });
        expect(result.limits?.fileSize).toBe(5 * 1024 * 1024);
    });
    it("should preserve filter function", () => {
        const filter = jest.fn().mockResolvedValue(true);
        const result = (0, options_1.transformUploadOptions)({ filter });
        expect(result.filter).toBe(filter);
    });
});
//# sourceMappingURL=options.spec.js.map