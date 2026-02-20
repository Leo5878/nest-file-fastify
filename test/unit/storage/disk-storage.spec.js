"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const disk_storage_1 = require("../../../src/storage/disk-storage");
const helpers_1 = require("../../helpers");
const os_1 = require("os");
const fs_1 = require("fs");
const path_1 = require("path");
describe("DiskStorage", () => {
    let tmpPath;
    beforeAll(async () => {
        tmpPath = (0, path_1.join)((0, os_1.tmpdir)(), `nest-file-fastify-tests-${Date.now()}`);
        await fs_1.promises.mkdir(tmpPath, { recursive: true });
        process.env.__TESTS_TMP_PATH__ = tmpPath;
    });
    afterAll(async () => {
        delete process.env.__TESTS_TMP_PATH__;
        await fs_1.promises.rm(tmpPath, { recursive: true, force: true });
    });
    describe("handleFile", () => {
        it("should save file to disk and return correct metadata", async () => {
            const storage = new disk_storage_1.DiskStorage({ dest: tmpPath });
            const content = Buffer.from("disk file content");
            const part = (0, helpers_1.createMockFilePart)({
                fieldname: "file",
                filename: "upload.txt",
                mimetype: "text/plain",
                encoding: "7bit",
                content,
            });
            const req = (0, helpers_1.createMockRequest)();
            const result = await storage.handleFile(part, req);
            expect(result.dest).toBe(tmpPath);
            expect(result.filename).toBeTruthy();
            expect(result.path).toContain(tmpPath);
            expect(result.size).toBe(content.length);
            expect(result.mimetype).toBe("text/plain");
            expect(result.encoding).toBe("7bit");
            expect(result.fieldname).toBe("file");
            expect(result.originalFilename).toBe("upload.txt");
        });
        it("should actually write file contents to disk", async () => {
            const storage = new disk_storage_1.DiskStorage({ dest: tmpPath });
            const content = Buffer.from("actual file content to verify");
            const part = (0, helpers_1.createMockFilePart)({ content, filename: "verify.txt" });
            const req = (0, helpers_1.createMockRequest)();
            const result = await storage.handleFile(part, req);
            const savedContent = await fs_1.promises.readFile(result.path);
            expect(savedContent).toEqual(content);
        });
        it("should generate unique filename preserving extension", async () => {
            const storage = new disk_storage_1.DiskStorage({ dest: tmpPath });
            const part1 = (0, helpers_1.createMockFilePart)({ filename: "photo.jpg" });
            const part2 = (0, helpers_1.createMockFilePart)({ filename: "photo.jpg" });
            const req = (0, helpers_1.createMockRequest)();
            const file1 = await storage.handleFile(part1, req);
            const file2 = await storage.handleFile(part2, req);
            expect(file1.filename).not.toBe(file2.filename);
            expect(file1.filename).toMatch(/\.jpg$/);
            expect(file2.filename).toMatch(/\.jpg$/);
        });
        it("should use custom filename handler", async () => {
            const storage = new disk_storage_1.DiskStorage({
                dest: tmpPath,
                filename: () => "custom-name.txt",
            });
            const part = (0, helpers_1.createMockFilePart)({ filename: "original.txt" });
            const req = (0, helpers_1.createMockRequest)();
            const result = await storage.handleFile(part, req);
            expect(result.filename).toBe("custom-name.txt");
        });
        it("should create destination directory if it does not exist", async () => {
            const newDir = (0, path_1.join)(tmpPath, "subdir", "nested");
            const storage = new disk_storage_1.DiskStorage({ dest: newDir });
            const part = (0, helpers_1.createMockFilePart)({});
            const req = (0, helpers_1.createMockRequest)();
            await storage.handleFile(part, req);
            const dirStat = await fs_1.promises.stat(newDir);
            expect(dirStat.isDirectory()).toBe(true);
        });
    });
    describe("removeFile", () => {
        it("should not delete file by default (removeAfter not set)", async () => {
            const storage = new disk_storage_1.DiskStorage({ dest: tmpPath });
            const part = (0, helpers_1.createMockFilePart)({ filename: "keep.txt" });
            const req = (0, helpers_1.createMockRequest)();
            const file = await storage.handleFile(part, req);
            await storage.removeFile(file);
            const stat = await fs_1.promises.stat(file.path);
            expect(stat).toBeTruthy();
        });
        it("should delete file when removeAfter is true", async () => {
            const storage = new disk_storage_1.DiskStorage({ dest: tmpPath, removeAfter: true });
            const part = (0, helpers_1.createMockFilePart)({ filename: "delete-me.txt" });
            const req = (0, helpers_1.createMockRequest)();
            const file = await storage.handleFile(part, req);
            await storage.removeFile(file);
            await expect(fs_1.promises.stat(file.path)).rejects.toThrow();
        });
        it("should delete file when force is true regardless of removeAfter", async () => {
            const storage = new disk_storage_1.DiskStorage({ dest: tmpPath, removeAfter: false });
            const part = (0, helpers_1.createMockFilePart)({ filename: "force-delete.txt" });
            const req = (0, helpers_1.createMockRequest)();
            const file = await storage.handleFile(part, req);
            await storage.removeFile(file, true);
            await expect(fs_1.promises.stat(file.path)).rejects.toThrow();
        });
    });
});
// ─── DiskStorage constructor with __TESTS_TMP_PATH__ env var ─────────────────
// ENV_TESTS_STORAGE_TMP_PATH is a module-level const, so it's read at import
// time. We must reset modules and re-require after setting the env var.
describe("DiskStorage – __TESTS_TMP_PATH__ override and tmpdir() fallback", () => {
    let envTmpPath;
    beforeAll(async () => {
        envTmpPath = (0, path_1.join)((0, os_1.tmpdir)(), `nest-file-fastify-env-tests-${Date.now()}`);
        await fs_1.promises.mkdir(envTmpPath, { recursive: true });
    });
    afterAll(async () => {
        delete process.env.__TESTS_TMP_PATH__;
        jest.resetModules();
        await fs_1.promises.rm(envTmpPath, { recursive: true, force: true });
    });
    it("should override dest with __TESTS_TMP_PATH__ when env var is set at import time", async () => {
        process.env.__TESTS_TMP_PATH__ = envTmpPath;
        jest.resetModules();
        const { DiskStorage } = await Promise.resolve().then(() => __importStar(require("../../../src/storage/disk-storage")));
        const { createMockFilePart, createMockRequest } = await Promise.resolve().then(() => __importStar(require("../../helpers")));
        const storage = new DiskStorage(); // no dest option
        const part = createMockFilePart({ filename: "env-test.txt" });
        const req = createMockRequest();
        const file = await storage.handleFile(part, req);
        expect(file.dest).toBe(envTmpPath);
    });
    it("should fall back to tmpdir() when no dest and no env var set", async () => {
        delete process.env.__TESTS_TMP_PATH__;
        jest.resetModules();
        const { DiskStorage } = await Promise.resolve().then(() => __importStar(require("../../../src/storage/disk-storage")));
        const { createMockFilePart, createMockRequest } = await Promise.resolve().then(() => __importStar(require("../../helpers")));
        const storage = new DiskStorage(); // no dest, no env var → tmpdir() branch
        const part = createMockFilePart({ filename: "tmpdir-test.txt" });
        const req = createMockRequest();
        const file = await storage.handleFile(part, req);
        expect(file.dest).toBe((0, os_1.tmpdir)());
        // cleanup
        await fs_1.promises.unlink(file.path).catch(() => { });
    });
});
//# sourceMappingURL=disk-storage.spec.js.map