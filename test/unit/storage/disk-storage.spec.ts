import { DiskStorage } from "../../../src/storage/disk-storage";
import { createMockFilePart, createMockRequest } from "../../helpers";
import { tmpdir } from "os";
import { promises as fs } from "fs";
import { join } from "path";

describe("DiskStorage", () => {
  let tmpPath: string;

  beforeAll(async () => {
    tmpPath = join(tmpdir(), `nest-file-fastify-tests-${Date.now()}`);
    await fs.mkdir(tmpPath, { recursive: true });
    process.env.__TESTS_TMP_PATH__ = tmpPath;
  });

  afterAll(async () => {
    delete process.env.__TESTS_TMP_PATH__;
    await fs.rm(tmpPath, { recursive: true, force: true });
  });

  describe("handleFile", () => {
    it("should save file to disk and return correct metadata", async () => {
      const storage = new DiskStorage({ dest: tmpPath });
      const content = Buffer.from("disk file content");
      const part = createMockFilePart({
        fieldname: "file",
        filename: "upload.txt",
        mimetype: "text/plain",
        encoding: "7bit",
        content,
      });
      const req = createMockRequest();

      const result = await storage.handleFile(part as any, req);

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
      const storage = new DiskStorage({ dest: tmpPath });
      const content = Buffer.from("actual file content to verify");
      const part = createMockFilePart({ content, filename: "verify.txt" });
      const req = createMockRequest();

      const result = await storage.handleFile(part as any, req);

      const savedContent = await fs.readFile(result.path);
      expect(savedContent).toEqual(content);
    });

    it("should generate unique filename preserving extension", async () => {
      const storage = new DiskStorage({ dest: tmpPath });
      const part1 = createMockFilePart({ filename: "photo.jpg" });
      const part2 = createMockFilePart({ filename: "photo.jpg" });
      const req = createMockRequest();

      const file1 = await storage.handleFile(part1 as any, req);
      const file2 = await storage.handleFile(part2 as any, req);

      expect(file1.filename).not.toBe(file2.filename);
      expect(file1.filename).toMatch(/\.jpg$/);
      expect(file2.filename).toMatch(/\.jpg$/);
    });

    it("should use custom filename handler", async () => {
      const storage = new DiskStorage({
        dest: tmpPath,
        filename: () => "custom-name.txt",
      });
      const part = createMockFilePart({ filename: "original.txt" });
      const req = createMockRequest();

      const result = await storage.handleFile(part as any, req);

      expect(result.filename).toBe("custom-name.txt");
    });

    it("should create destination directory if it does not exist", async () => {
      const newDir = join(tmpPath, "subdir", "nested");
      const storage = new DiskStorage({ dest: newDir });
      const part = createMockFilePart({});
      const req = createMockRequest();

      await storage.handleFile(part as any, req);

      const dirStat = await fs.stat(newDir);
      expect(dirStat.isDirectory()).toBe(true);
    });
  });

  describe("removeFile", () => {
    it("should not delete file by default (removeAfter not set)", async () => {
      const storage = new DiskStorage({ dest: tmpPath });
      const part = createMockFilePart({ filename: "keep.txt" });
      const req = createMockRequest();

      const file = await storage.handleFile(part as any, req);
      await storage.removeFile(file);

      const stat = await fs.stat(file.path);
      expect(stat).toBeTruthy();
    });

    it("should delete file when removeAfter is true", async () => {
      const storage = new DiskStorage({ dest: tmpPath, removeAfter: true });
      const part = createMockFilePart({ filename: "delete-me.txt" });
      const req = createMockRequest();

      const file = await storage.handleFile(part as any, req);
      await storage.removeFile(file);

      await expect(fs.stat(file.path)).rejects.toThrow();
    });

    it("should delete file when force is true regardless of removeAfter", async () => {
      const storage = new DiskStorage({ dest: tmpPath, removeAfter: false });
      const part = createMockFilePart({ filename: "force-delete.txt" });
      const req = createMockRequest();

      const file = await storage.handleFile(part as any, req);
      await storage.removeFile(file, true);

      await expect(fs.stat(file.path)).rejects.toThrow();
    });
  });
});

// ─── DiskStorage constructor with __TESTS_TMP_PATH__ env var ─────────────────
// ENV_TESTS_STORAGE_TMP_PATH is a module-level const, so it's read at import
// time. We must reset modules and re-require after setting the env var.

describe("DiskStorage – __TESTS_TMP_PATH__ override and tmpdir() fallback", () => {
  let envTmpPath: string;

  beforeAll(async () => {
    envTmpPath = join(tmpdir(), `nest-file-fastify-env-tests-${Date.now()}`);
    await fs.mkdir(envTmpPath, { recursive: true });
  });

  afterAll(async () => {
    delete process.env.__TESTS_TMP_PATH__;
    jest.resetModules();
    await fs.rm(envTmpPath, { recursive: true, force: true });
  });

  it("should override dest with __TESTS_TMP_PATH__ when env var is set at import time", async () => {
    process.env.__TESTS_TMP_PATH__ = envTmpPath;
    jest.resetModules();

    const { DiskStorage } = await import("../../../src/storage/disk-storage");
    const { createMockFilePart, createMockRequest } = await import("../../helpers");

    const storage = new DiskStorage(); // no dest option
    const part = createMockFilePart({ filename: "env-test.txt" });
    const req = createMockRequest();

    const file = await storage.handleFile(part as any, req);

    expect(file.dest).toBe(envTmpPath);
  });

  it("should fall back to tmpdir() when no dest and no env var set", async () => {
    delete process.env.__TESTS_TMP_PATH__;
    jest.resetModules();

    const { DiskStorage } = await import("../../../src/storage/disk-storage");
    const { createMockFilePart, createMockRequest } = await import("../../helpers");

    const storage = new DiskStorage(); // no dest, no env var → tmpdir() branch
    const part = createMockFilePart({ filename: "tmpdir-test.txt" });
    const req = createMockRequest();

    const file = await storage.handleFile(part as any, req);

    expect(file.dest).toBe(tmpdir());

    // cleanup
    await fs.unlink(file.path).catch(() => {});
  });
});
