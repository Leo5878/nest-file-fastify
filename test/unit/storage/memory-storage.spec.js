"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const memory_storage_1 = require("../../../src/storage/memory-storage");
const helpers_1 = require("../../helpers");
describe("MemoryStorage", () => {
    let storage;
    beforeEach(() => {
        storage = new memory_storage_1.MemoryStorage();
    });
    describe("handleFile", () => {
        it("should return a file with buffer", async () => {
            const content = Buffer.from("hello world");
            const part = (0, helpers_1.createMockFilePart)({
                fieldname: "file",
                filename: "test.txt",
                mimetype: "text/plain",
                encoding: "7bit",
                content,
            });
            const req = (0, helpers_1.createMockRequest)();
            const result = await storage.handleFile(part, req);
            expect(result.buffer).toEqual(content);
            expect(result.size).toBe(content.length);
            expect(result.fieldname).toBe("file");
            expect(result.mimetype).toBe("text/plain");
            expect(result.encoding).toBe("7bit");
            expect(result.originalFilename).toBe("test.txt");
        });
        it("should generate a unique filename", async () => {
            const part1 = (0, helpers_1.createMockFilePart)({ filename: "photo.jpg" });
            const part2 = (0, helpers_1.createMockFilePart)({ filename: "photo.jpg" });
            const req = (0, helpers_1.createMockRequest)();
            const file1 = await storage.handleFile(part1, req);
            const file2 = await storage.handleFile(part2, req);
            expect(file1.filename).not.toBe(file2.filename);
        });
        it("should preserve the original file extension", async () => {
            const part = (0, helpers_1.createMockFilePart)({ filename: "image.png" });
            const req = (0, helpers_1.createMockRequest)();
            const result = await storage.handleFile(part, req);
            expect(result.filename).toMatch(/\.png$/);
        });
        it("should set correct size from buffer length", async () => {
            const content = Buffer.from("12345678");
            const part = (0, helpers_1.createMockFilePart)({ content });
            const req = (0, helpers_1.createMockRequest)();
            const result = await storage.handleFile(part, req);
            expect(result.size).toBe(8);
        });
    });
    describe("removeFile", () => {
        it("should delete buffer from file object", async () => {
            const part = (0, helpers_1.createMockFilePart)({});
            const req = (0, helpers_1.createMockRequest)();
            const file = await storage.handleFile(part, req);
            expect(file.buffer).toBeDefined();
            await storage.removeFile(file);
            expect(file.buffer).toBeUndefined();
        });
        it("should not throw when removing already cleaned up file", async () => {
            const part = (0, helpers_1.createMockFilePart)({});
            const req = (0, helpers_1.createMockRequest)();
            const file = await storage.handleFile(part, req);
            await storage.removeFile(file);
            await expect(storage.removeFile(file)).resolves.not.toThrow();
        });
    });
});
//# sourceMappingURL=memory-storage.spec.js.map