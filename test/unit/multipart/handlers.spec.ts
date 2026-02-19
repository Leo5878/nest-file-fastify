import { BadRequestException } from "@nestjs/common";
import { handleMultipartSingleFile } from "../../../src/multipart/handlers/single-file";
import { handleMultipartMultipleFiles } from "../../../src/multipart/handlers/multiple-files";
import { handleMultipartAnyFiles } from "../../../src/multipart/handlers/any-files";
import {
  handleMultipartFileFields,
  uploadFieldsToMap,
} from "../../../src/multipart/handlers/file-fields";
import { MemoryStorage } from "../../../src/storage/memory-storage";
import {
  createMockFilePart,
  createMockFieldPart,
  createPartsIterator,
} from "../../helpers";
import { transformUploadOptions } from "../../../src/multipart/options";

function buildRequest(parts: any[]) {
  return {
    isMultipart: () => true,
    parts: () => createPartsIterator(parts),
  } as any;
}

function buildOptions(overrides = {}) {
  return transformUploadOptions({ storage: new MemoryStorage(), ...overrides });
}

// ─── handleMultipartSingleFile ───────────────────────────────────────────────

describe("handleMultipartSingleFile", () => {
  it("should return file and empty body when only file part is present", async () => {
    const filePart = createMockFilePart({ fieldname: "avatar" });
    const req = buildRequest([filePart]);

    const { file, body } = await handleMultipartSingleFile(
      req,
      "avatar",
      buildOptions(),
    );

    expect(file).toBeDefined();
    expect(file?.fieldname).toBe("avatar");
    expect(body).toEqual({});
  });

  it("should parse text fields into body", async () => {
    const filePart = createMockFilePart({ fieldname: "photo" });
    const fieldPart = createMockFieldPart("username", "john");
    const req = buildRequest([fieldPart, filePart]);

    const { body } = await handleMultipartSingleFile(
      req,
      "photo",
      buildOptions(),
    );

    expect(body.username).toBe("john");
  });

  it("should return undefined file when no file is uploaded", async () => {
    const fieldPart = createMockFieldPart("name", "value");
    const req = buildRequest([fieldPart]);

    const { file, body } = await handleMultipartSingleFile(
      req,
      "photo",
      buildOptions(),
    );

    expect(file).toBeUndefined();
    expect(body.name).toBe("value");
  });

  it("should throw BadRequestException when wrong field name is used", async () => {
    const filePart = createMockFilePart({ fieldname: "wrongField" });
    const req = buildRequest([filePart]);

    await expect(
      handleMultipartSingleFile(req, "avatar", buildOptions()),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("should throw BadRequestException when more than one file is uploaded to the same field", async () => {
    const filePart1 = createMockFilePart({ fieldname: "avatar" });
    const filePart2 = createMockFilePart({ fieldname: "avatar" });
    const req = buildRequest([filePart1, filePart2]);

    await expect(
      handleMultipartSingleFile(req, "avatar", buildOptions()),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("should skip file when filter returns false", async () => {
    const filePart = createMockFilePart({ fieldname: "photo" });
    const req = buildRequest([filePart]);
    const filter = jest.fn().mockResolvedValue(false);

    const { file } = await handleMultipartSingleFile(
      req,
      "photo",
      buildOptions({ filter }),
    );

    expect(file).toBeUndefined();
  });

  it("should remove files on error", async () => {
    const storage = new MemoryStorage();
    storage.removeFile = jest.fn().mockResolvedValue(undefined);

    const filePart1 = createMockFilePart({ fieldname: "avatar" });
    const filePart2 = createMockFilePart({ fieldname: "avatar" });
    const req = buildRequest([filePart1, filePart2]);

    await expect(
      handleMultipartSingleFile(req, "avatar", { ...buildOptions(), storage }),
    ).rejects.toThrow();

    expect(storage.removeFile).toHaveBeenCalledWith(
      expect.anything(),
      true,
    );
  });
});

// ─── handleMultipartMultipleFiles ────────────────────────────────────────────

describe("handleMultipartMultipleFiles", () => {
  it("should return array of files", async () => {
    const part1 = createMockFilePart({ fieldname: "files", filename: "a.txt" });
    const part2 = createMockFilePart({ fieldname: "files", filename: "b.txt" });
    const req = buildRequest([part1, part2]);

    const { files } = await handleMultipartMultipleFiles(
      req,
      "files",
      10,
      buildOptions(),
    );

    expect(files).toHaveLength(2);
  });

  it("should throw BadRequestException when maxCount is exceeded", async () => {
    const part1 = createMockFilePart({ fieldname: "files" });
    const part2 = createMockFilePart({ fieldname: "files" });
    const req = buildRequest([part1, part2]);

    await expect(
      handleMultipartMultipleFiles(req, "files", 1, buildOptions()),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("should throw BadRequestException for unexpected field name", async () => {
    const part = createMockFilePart({ fieldname: "unexpected" });
    const req = buildRequest([part]);

    await expect(
      handleMultipartMultipleFiles(req, "files", 5, buildOptions()),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("should parse text fields into body alongside files", async () => {
    const filePart = createMockFilePart({ fieldname: "docs" });
    const fieldPart = createMockFieldPart("title", "my docs");
    const req = buildRequest([fieldPart, filePart]);

    const { body, files } = await handleMultipartMultipleFiles(
      req,
      "docs",
      5,
      buildOptions(),
    );

    expect(body.title).toBe("my docs");
    expect(files).toHaveLength(1);
  });

  it("should return empty array when no files uploaded", async () => {
    const req = buildRequest([]);

    const { files } = await handleMultipartMultipleFiles(
      req,
      "files",
      5,
      buildOptions(),
    );

    expect(files).toHaveLength(0);
  });

  it("should filter out files where filter returns false", async () => {
    const part1 = createMockFilePart({ fieldname: "files", mimetype: "image/png" });
    const part2 = createMockFilePart({ fieldname: "files", mimetype: "text/plain" });
    const req = buildRequest([part1, part2]);

    const filter = (_: any, file: any) => file.mimetype.startsWith("image/");

    const { files } = await handleMultipartMultipleFiles(
      req,
      "files",
      5,
      buildOptions({ filter }),
    );

    expect(files).toHaveLength(1);
    expect(files[0].mimetype).toBe("image/png");
  });
});

// ─── handleMultipartAnyFiles ─────────────────────────────────────────────────

describe("handleMultipartAnyFiles", () => {
  it("should accept files from any field", async () => {
    const part1 = createMockFilePart({ fieldname: "avatar" });
    const part2 = createMockFilePart({ fieldname: "document" });
    const req = buildRequest([part1, part2]);

    const { files } = await handleMultipartAnyFiles(req, buildOptions());

    expect(files).toHaveLength(2);
  });

  it("should parse text fields into body", async () => {
    const filePart = createMockFilePart({ fieldname: "photo" });
    const fieldPart = createMockFieldPart("name", "test");
    const req = buildRequest([filePart, fieldPart]);

    const { body } = await handleMultipartAnyFiles(req, buildOptions());

    expect(body.name).toBe("test");
  });

  it("should return empty array when no files uploaded", async () => {
    const req = buildRequest([]);

    const { files } = await handleMultipartAnyFiles(req, buildOptions());

    expect(files).toHaveLength(0);
  });

  it("should apply filter across all fields", async () => {
    const imgPart = createMockFilePart({ fieldname: "a", mimetype: "image/jpeg" });
    const txtPart = createMockFilePart({ fieldname: "b", mimetype: "text/plain" });
    const req = buildRequest([imgPart, txtPart]);

    const filter = (_: any, file: any) => file.mimetype === "image/jpeg";

    const { files } = await handleMultipartAnyFiles(req, buildOptions({ filter }));

    expect(files).toHaveLength(1);
  });

  it("should remove already-stored files and rethrow when storage throws mid-upload", async () => {
    const storage = new MemoryStorage();
    let callCount = 0;

    jest.spyOn(storage, "handleFile").mockImplementation(async () => {
      callCount++;
      if (callCount === 2) throw new Error("storage failure");
      return {
        fieldname: "file",
        mimetype: "text/plain",
        encoding: "7bit",
        size: 5,
        filename: "mock.txt",
        originalFilename: "mock.txt",
        buffer: Buffer.from("hello"),
      };
    });

    const removeSpy = jest.spyOn(storage, "removeFile");

    const part1 = createMockFilePart({ fieldname: "a" });
    const part2 = createMockFilePart({ fieldname: "b" });
    const req = buildRequest([part1, part2]);

    const opts = transformUploadOptions({ storage });

    await expect(handleMultipartAnyFiles(req, opts)).rejects.toThrow("storage failure");

    // the first successfully stored file should have been removed with force=true
    expect(removeSpy).toHaveBeenCalledTimes(1);
    expect(removeSpy).toHaveBeenCalledWith(expect.anything(), true);
  });
});

// ─── handleMultipartFileFields ───────────────────────────────────────────────

describe("handleMultipartFileFields", () => {
  it("should group files by field name", async () => {
    const avatar = createMockFilePart({ fieldname: "avatar" });
    const doc = createMockFilePart({ fieldname: "document" });
    const req = buildRequest([avatar, doc]);

    const fieldsMap = uploadFieldsToMap([
      { name: "avatar", maxCount: 1 },
      { name: "document", maxCount: 1 },
    ]);

    const { files } = await handleMultipartFileFields(
      req,
      fieldsMap,
      buildOptions(),
    );

    expect(files["avatar"]).toHaveLength(1);
    expect(files["document"]).toHaveLength(1);
  });

  it("should throw BadRequestException for unknown field", async () => {
    const part = createMockFilePart({ fieldname: "unknown" });
    const req = buildRequest([part]);

    const fieldsMap = uploadFieldsToMap([{ name: "avatar" }]);

    await expect(
      handleMultipartFileFields(req, fieldsMap, buildOptions()),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("should throw BadRequestException when maxCount per field is exceeded", async () => {
    const part1 = createMockFilePart({ fieldname: "avatar" });
    const part2 = createMockFilePart({ fieldname: "avatar" });
    const req = buildRequest([part1, part2]);

    const fieldsMap = uploadFieldsToMap([{ name: "avatar", maxCount: 1 }]);

    await expect(
      handleMultipartFileFields(req, fieldsMap, buildOptions()),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("should default maxCount to 1 when not specified", async () => {
    const part1 = createMockFilePart({ fieldname: "avatar" });
    const part2 = createMockFilePart({ fieldname: "avatar" });
    const req = buildRequest([part1, part2]);

    const fieldsMap = uploadFieldsToMap([{ name: "avatar" }]);

    await expect(
      handleMultipartFileFields(req, fieldsMap, buildOptions()),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("should accept multiple files within maxCount limit", async () => {
    const part1 = createMockFilePart({ fieldname: "photos" });
    const part2 = createMockFilePart({ fieldname: "photos" });
    const req = buildRequest([part1, part2]);

    const fieldsMap = uploadFieldsToMap([{ name: "photos", maxCount: 5 }]);

    const { files } = await handleMultipartFileFields(
      req,
      fieldsMap,
      buildOptions(),
    );

    expect(files["photos"]).toHaveLength(2);
  });

  it("should parse text fields into body", async () => {
    const fieldPart = createMockFieldPart("title", "my upload");
    const filePart = createMockFilePart({ fieldname: "doc" });
    const req = buildRequest([fieldPart, filePart]);

    const fieldsMap = uploadFieldsToMap([{ name: "doc" }]);

    const { body } = await handleMultipartFileFields(
      req,
      fieldsMap,
      buildOptions(),
    );

    expect(body.title).toBe("my upload");
  });

  it("should not include file when filter returns false", async () => {
    const part = createMockFilePart({ fieldname: "avatar", mimetype: "text/plain" });
    const req = buildRequest([part]);

    const fieldsMap = uploadFieldsToMap([{ name: "avatar", maxCount: 1 }]);
    const filter = (_: any, file: any) => file.mimetype === "image/png";

    const { files } = await handleMultipartFileFields(
      req,
      fieldsMap,
      buildOptions({ filter }),
    );

    expect(files["avatar"] ?? []).toHaveLength(0);
  });

  it("should remove already-stored files and rethrow when storage throws mid-upload", async () => {
    const storage = new MemoryStorage();
    let callCount = 0;

    jest.spyOn(storage, "handleFile").mockImplementation(async () => {
      callCount++;
      if (callCount === 2) throw new Error("storage failure in file-fields");
      return {
        fieldname: "photos",
        mimetype: "text/plain",
        encoding: "7bit",
        size: 5,
        filename: "mock.txt",
        originalFilename: "mock.txt",
        buffer: Buffer.from("hello"),
      };
    });

    const removeSpy = jest.spyOn(storage, "removeFile");

    const part1 = createMockFilePart({ fieldname: "photos" });
    const part2 = createMockFilePart({ fieldname: "photos" });
    const req = buildRequest([part1, part2]);

    const fieldsMap = uploadFieldsToMap([{ name: "photos", maxCount: 5 }]);
    const opts = transformUploadOptions({ storage });

    await expect(
      handleMultipartFileFields(req, fieldsMap, opts),
    ).rejects.toThrow("storage failure in file-fields");

    expect(removeSpy).toHaveBeenCalledTimes(1);
    expect(removeSpy).toHaveBeenCalledWith(expect.anything(), true);
  });
});

// ─── uploadFieldsToMap ────────────────────────────────────────────────────────

describe("uploadFieldsToMap", () => {
  it("should create a map with default maxCount of 1", () => {
    const map = uploadFieldsToMap([{ name: "file" }]);
    expect(map.get("file")?.maxCount).toBe(1);
  });

  it("should create a map with specified maxCount", () => {
    const map = uploadFieldsToMap([{ name: "photos", maxCount: 5 }]);
    expect(map.get("photos")?.maxCount).toBe(5);
  });

  it("should handle multiple fields", () => {
    const map = uploadFieldsToMap([
      { name: "avatar", maxCount: 1 },
      { name: "gallery", maxCount: 10 },
    ]);
    expect(map.size).toBe(2);
    expect(map.get("avatar")?.maxCount).toBe(1);
    expect(map.get("gallery")?.maxCount).toBe(10);
  });
});
