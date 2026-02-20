"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const files_interceptor_1 = require("../../../src/interceptors/files-interceptor");
const memory_storage_1 = require("../../../src/storage/memory-storage");
const helpers_1 = require("../../helpers");
function buildRequest(parts) {
    return {
        isMultipart: () => true,
        parts: () => (0, helpers_1.createPartsIterator)(parts),
        body: {},
        storageFiles: undefined,
    };
}
function buildOptions() {
    return { storage: new memory_storage_1.MemoryStorage() };
}
describe("FilesInterceptor", () => {
    it("should create an interceptor class", () => {
        const Interceptor = (0, files_interceptor_1.FilesInterceptor)("files", 3, buildOptions());
        expect(Interceptor).toBeDefined();
        const instance = new Interceptor();
        expect(instance).toBeInstanceOf(Interceptor);
    });
    it("should use default maxCount of 1 when not provided", async () => {
        // exercises the `maxCount = 1` default parameter branch
        const Interceptor = (0, files_interceptor_1.FilesInterceptor)("files", undefined, buildOptions());
        const instance = new Interceptor();
        const filePart = (0, helpers_1.createMockFilePart)({ fieldname: "files" });
        const req = buildRequest([filePart]);
        const ctx = (0, helpers_1.createMockContext)(req);
        const next = (0, helpers_1.createMockCallHandler)();
        await instance.intercept(ctx, next);
        expect(req.storageFiles).toHaveLength(1);
    });
    it("should set storageFiles on the request", async () => {
        const Interceptor = (0, files_interceptor_1.FilesInterceptor)("photos", 5, buildOptions());
        const instance = new Interceptor();
        const parts = [
            (0, helpers_1.createMockFilePart)({ fieldname: "photos", filename: "a.jpg" }),
            (0, helpers_1.createMockFilePart)({ fieldname: "photos", filename: "b.jpg" }),
        ];
        const req = buildRequest(parts);
        const ctx = (0, helpers_1.createMockContext)(req);
        const next = (0, helpers_1.createMockCallHandler)();
        await instance.intercept(ctx, next);
        expect(req.storageFiles).toHaveLength(2);
    });
    it("should set body fields on the request", async () => {
        const Interceptor = (0, files_interceptor_1.FilesInterceptor)("file", 1, buildOptions());
        const instance = new Interceptor();
        const parts = [
            (0, helpers_1.createMockFieldPart)("title", "hello"),
            (0, helpers_1.createMockFilePart)({ fieldname: "file" }),
        ];
        const req = buildRequest(parts);
        const ctx = (0, helpers_1.createMockContext)(req);
        const next = (0, helpers_1.createMockCallHandler)();
        await instance.intercept(ctx, next);
        expect(req.body.title).toBe("hello");
    });
    it("should work without options (uses default storage)", async () => {
        // no options passed at all
        const Interceptor = (0, files_interceptor_1.FilesInterceptor)("file");
        const instance = new Interceptor();
        const req = buildRequest([(0, helpers_1.createMockFilePart)({ fieldname: "file" })]);
        const ctx = (0, helpers_1.createMockContext)(req);
        const next = (0, helpers_1.createMockCallHandler)();
        await instance.intercept(ctx, next);
        expect(req.storageFiles).toHaveLength(1);
    });
});
//# sourceMappingURL=files-interceptor.spec.js.map