import {
  transformUploadOptions,
  DEFAULT_UPLOAD_OPTIONS,
} from "../../../src/multipart/options";
import { MemoryStorage } from "../../../src/storage/memory-storage";
import { DiskStorage } from "../../../src/storage/disk-storage";

describe("transformUploadOptions", () => {
  it("should return default options when no options provided", () => {
    const result = transformUploadOptions();
    expect(result).toEqual(DEFAULT_UPLOAD_OPTIONS);
    expect(result.storage).toBeInstanceOf(MemoryStorage);
  });

  it("should return default options when undefined is passed", () => {
    const result = transformUploadOptions(undefined);
    expect(result.storage).toBeInstanceOf(MemoryStorage);
  });

  it("should create DiskStorage when dest is provided", () => {
    const result = transformUploadOptions({ dest: "/tmp/uploads" });
    expect(result.storage).toBeInstanceOf(DiskStorage);
  });

  it("should pass dest to DiskStorage options", () => {
    const result = transformUploadOptions({ dest: "/tmp/uploads" });
    expect((result.storage as DiskStorage).options?.dest).toBe("/tmp/uploads");
  });

  it("should merge custom options with defaults when no dest", () => {
    const customStorage = new MemoryStorage();
    const result = transformUploadOptions({ storage: customStorage });
    expect(result.storage).toBe(customStorage);
  });

  it("should preserve busboy options like limits", () => {
    const result = transformUploadOptions({
      limits: { fileSize: 5 * 1024 * 1024 },
    });
    expect(result.limits?.fileSize).toBe(5 * 1024 * 1024);
  });

  it("should preserve filter function", () => {
    const filter = jest.fn().mockResolvedValue(true);
    const result = transformUploadOptions({ filter });
    expect(result.filter).toBe(filter);
  });
});
