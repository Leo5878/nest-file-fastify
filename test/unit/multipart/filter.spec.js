"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const filter_1 = require("../../../src/multipart/filter");
const memory_storage_1 = require("../../../src/storage/memory-storage");
const helpers_1 = require("../../helpers");
const mockFile = {
    fieldname: "file",
    filename: "test.txt",
    mimetype: "text/plain",
    encoding: "7bit",
    size: 100,
    buffer: Buffer.from("test"),
    originalFilename: "test.txt",
};
describe("filterUpload", () => {
    let storage;
    let req;
    beforeEach(() => {
        storage = new memory_storage_1.MemoryStorage();
        storage.removeFile = jest.fn().mockResolvedValue(undefined);
        req = (0, helpers_1.createMockRequest)();
    });
    it("should return true when no filter is set", async () => {
        const result = await (0, filter_1.filterUpload)({ storage }, req, mockFile);
        expect(result).toBe(true);
    });
    it("should return true when filter returns true", async () => {
        const filter = jest.fn().mockResolvedValue(true);
        const result = await (0, filter_1.filterUpload)({ storage, filter }, req, mockFile);
        expect(result).toBe(true);
        expect(filter).toHaveBeenCalledWith(req, mockFile);
    });
    it("should return false when filter returns false", async () => {
        const filter = jest.fn().mockResolvedValue(false);
        const result = await (0, filter_1.filterUpload)({ storage, filter }, req, mockFile);
        expect(result).toBe(false);
    });
    it("should throw BadRequestException when filter returns a string message", async () => {
        const filter = jest.fn().mockResolvedValue("File type not allowed");
        await expect((0, filter_1.filterUpload)({ storage, filter }, req, mockFile)).rejects.toBeInstanceOf(common_1.BadRequestException);
    });
    it("should remove file and rethrow when filter throws", async () => {
        const error = new Error("filter error");
        const filter = jest.fn().mockRejectedValue(error);
        await expect((0, filter_1.filterUpload)({ storage, filter }, req, mockFile)).rejects.toThrow("filter error");
        expect(storage.removeFile).toHaveBeenCalledWith(mockFile, true);
    });
    it("should work with synchronous filter returning true", async () => {
        const filter = jest.fn().mockReturnValue(true);
        const result = await (0, filter_1.filterUpload)({ storage, filter }, req, mockFile);
        expect(result).toBe(true);
    });
    it("should work with synchronous filter returning false", async () => {
        const filter = jest.fn().mockReturnValue(false);
        const result = await (0, filter_1.filterUpload)({ storage, filter }, req, mockFile);
        expect(result).toBe(false);
    });
    it("should filter by mimetype", async () => {
        const filter = (_req, file) => file.mimetype.startsWith("image/");
        const imageFile = { ...mockFile, mimetype: "image/png" };
        const textFile = { ...mockFile, mimetype: "text/plain" };
        expect(await (0, filter_1.filterUpload)({ storage, filter }, req, imageFile)).toBe(true);
        expect(await (0, filter_1.filterUpload)({ storage, filter }, req, textFile)).toBe(false);
    });
});
//# sourceMappingURL=filter.spec.js.map