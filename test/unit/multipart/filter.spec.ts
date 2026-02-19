import { BadRequestException } from "@nestjs/common";
import { filterUpload } from "../../../src/multipart/filter";
import { MemoryStorage } from "../../../src/storage/memory-storage";
import { createMockRequest } from "../../helpers";

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
  let storage: MemoryStorage;
  let req: any;

  beforeEach(() => {
    storage = new MemoryStorage();
    storage.removeFile = jest.fn().mockResolvedValue(undefined);
    req = createMockRequest();
  });

  it("should return true when no filter is set", async () => {
    const result = await filterUpload({ storage }, req, mockFile);
    expect(result).toBe(true);
  });

  it("should return true when filter returns true", async () => {
    const filter = jest.fn().mockResolvedValue(true);
    const result = await filterUpload({ storage, filter }, req, mockFile);
    expect(result).toBe(true);
    expect(filter).toHaveBeenCalledWith(req, mockFile);
  });

  it("should return false when filter returns false", async () => {
    const filter = jest.fn().mockResolvedValue(false);
    const result = await filterUpload({ storage, filter }, req, mockFile);
    expect(result).toBe(false);
  });

  it("should throw BadRequestException when filter returns a string message", async () => {
    const filter = jest.fn().mockResolvedValue("File type not allowed");
    await expect(
      filterUpload({ storage, filter }, req, mockFile),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("should remove file and rethrow when filter throws", async () => {
    const error = new Error("filter error");
    const filter = jest.fn().mockRejectedValue(error);

    await expect(
      filterUpload({ storage, filter }, req, mockFile),
    ).rejects.toThrow("filter error");

    expect(storage.removeFile).toHaveBeenCalledWith(mockFile, true);
  });

  it("should work with synchronous filter returning true", async () => {
    const filter = jest.fn().mockReturnValue(true);
    const result = await filterUpload({ storage, filter }, req, mockFile);
    expect(result).toBe(true);
  });

  it("should work with synchronous filter returning false", async () => {
    const filter = jest.fn().mockReturnValue(false);
    const result = await filterUpload({ storage, filter }, req, mockFile);
    expect(result).toBe(false);
  });

  it("should filter by mimetype", async () => {
    const filter = (_req: any, file: any) =>
      file.mimetype.startsWith("image/");

    const imageFile = { ...mockFile, mimetype: "image/png" };
    const textFile = { ...mockFile, mimetype: "text/plain" };

    expect(await filterUpload({ storage, filter }, req, imageFile)).toBe(true);
    expect(await filterUpload({ storage, filter }, req, textFile)).toBe(false);
  });
});
