import { MemoryStorage } from "../../../src/storage/memory-storage";
import { createMockFilePart, createMockRequest } from "../../helpers";

describe("MemoryStorage", () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  describe("handleFile", () => {
    it("should return a file with buffer", async () => {
      const content = Buffer.from("hello world");
      const part = createMockFilePart({
        fieldname: "file",
        filename: "test.txt",
        mimetype: "text/plain",
        encoding: "7bit",
        content,
      });
      const req = createMockRequest();

      const result = await storage.handleFile(part as any, req);

      expect(result.buffer).toEqual(content);
      expect(result.size).toBe(content.length);
      expect(result.fieldname).toBe("file");
      expect(result.mimetype).toBe("text/plain");
      expect(result.encoding).toBe("7bit");
      expect(result.originalFilename).toBe("test.txt");
    });

    it("should generate a unique filename", async () => {
      const part1 = createMockFilePart({ filename: "photo.jpg" });
      const part2 = createMockFilePart({ filename: "photo.jpg" });
      const req = createMockRequest();

      const file1 = await storage.handleFile(part1 as any, req);
      const file2 = await storage.handleFile(part2 as any, req);

      expect(file1.filename).not.toBe(file2.filename);
    });

    it("should preserve the original file extension", async () => {
      const part = createMockFilePart({ filename: "image.png" });
      const req = createMockRequest();

      const result = await storage.handleFile(part as any, req);

      expect(result.filename).toMatch(/\.png$/);
    });

    it("should set correct size from buffer length", async () => {
      const content = Buffer.from("12345678");
      const part = createMockFilePart({ content });
      const req = createMockRequest();

      const result = await storage.handleFile(part as any, req);

      expect(result.size).toBe(8);
    });
  });

  describe("removeFile", () => {
    it("should delete buffer from file object", async () => {
      const part = createMockFilePart({});
      const req = createMockRequest();

      const file = await storage.handleFile(part as any, req);
      expect(file.buffer).toBeDefined();

      await storage.removeFile(file);
      expect(file.buffer).toBeUndefined();
    });

    it("should not throw when removing already cleaned up file", async () => {
      const part = createMockFilePart({});
      const req = createMockRequest();

      const file = await storage.handleFile(part as any, req);
      await storage.removeFile(file);

      await expect(storage.removeFile(file)).resolves.not.toThrow();
    });
  });
});
