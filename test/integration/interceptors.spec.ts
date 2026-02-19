import { Controller, Post, UseInterceptors } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import FormData from "form-data";

import { FileInterceptor } from "../../src/interceptors/file-interceptor";
import { FilesInterceptor } from "../../src/interceptors/files-interceptor";
import { FileFieldsInterceptor } from "../../src/interceptors/file-fields-interceptor";
import { AnyFilesInterceptor } from "../../src/interceptors/any-files-interceptor";
import { UploadedFile, UploadedFiles } from "../../src/decorators";
import { MemoryStorageFile } from "../../src/storage/memory-storage";

// ─── Test Controllers ─────────────────────────────────────────────────────────

@Controller()
class TestController {
  @Post("/single")
  @UseInterceptors(FileInterceptor("file"))
  uploadSingle(@UploadedFile() file: MemoryStorageFile) {
    return { fieldname: file?.fieldname, size: file?.size, filename: file?.filename };
  }

  @Post("/single-no-file")
  @UseInterceptors(FileInterceptor("file"))
  uploadSingleOptional(@UploadedFile() file: MemoryStorageFile) {
    return { received: !!file };
  }

  @Post("/multiple")
  @UseInterceptors(FilesInterceptor("files", 3))
  uploadMultiple(@UploadedFiles() files: MemoryStorageFile[]) {
    return { count: files?.length };
  }

  @Post("/fields")
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "avatar", maxCount: 1 },
      { name: "gallery", maxCount: 3 },
    ]),
  )
  uploadFields(@UploadedFiles() files: Record<string, MemoryStorageFile[]>) {
    return {
      avatar: files?.avatar?.length ?? 0,
      gallery: files?.gallery?.length ?? 0,
    };
  }

  @Post("/any")
  @UseInterceptors(AnyFilesInterceptor())
  uploadAny(@UploadedFiles() files: MemoryStorageFile[]) {
    return { count: files?.length };
  }

  @Post("/filtered")
  @UseInterceptors(
    FileInterceptor("file", {
      filter: (_req, file) => file.mimetype === "image/png",
    }),
  )
  uploadFiltered(@UploadedFile() file: MemoryStorageFile) {
    return { received: !!file };
  }

  @Post("/size-limit")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 10 },
    }),
  )
  uploadWithLimit(@UploadedFile() file: MemoryStorageFile) {
    return { size: file?.size };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createFileBuffer(content = "test file content") {
  return Buffer.from(content);
}

async function buildFormData(fields: Array<{ name: string; content: Buffer | string; filename?: string; mimetype?: string }>) {
  const form = new FormData();
  for (const field of fields) {
    if (field.filename) {
      form.append(field.name, field.content, {
        filename: field.filename,
        contentType: field.mimetype ?? "text/plain",
      });
    } else {
      form.append(field.name, field.content);
    }
  }
  return form;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Interceptors (integration)", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TestController],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await app.register(require("@fastify/multipart"), {
      limits: { fileSize: 5 * 1024 * 1024 },
    });

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── FileInterceptor ───────────────────────────────────────────────────────

  describe("FileInterceptor", () => {
    it("should upload a single file successfully", async () => {
      const form = await buildFormData([
        { name: "file", content: createFileBuffer(), filename: "test.txt" },
      ]);

      const response = await app.inject({
        method: "POST",
        url: "/single",
        payload: form.getBuffer(),
        headers: form.getHeaders(),
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.fieldname).toBe("file");
      expect(body.size).toBeGreaterThan(0);
      expect(body.filename).toBeTruthy();
    });

    it("should return 400 when request is not multipart", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/single",
        payload: JSON.stringify({ test: "data" }),
        headers: { "content-type": "application/json" },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should handle request with no file uploaded", async () => {
      const form = new FormData();
      form.append("name", "john");

      const response = await app.inject({
        method: "POST",
        url: "/single-no-file",
        payload: form.getBuffer(),
        headers: form.getHeaders(),
      });

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.body).received).toBe(false);
    });

    it("should return 400 when wrong field name is used", async () => {
      const form = await buildFormData([
        { name: "wrongField", content: createFileBuffer(), filename: "test.txt" },
      ]);

      const response = await app.inject({
        method: "POST",
        url: "/single",
        payload: form.getBuffer(),
        headers: form.getHeaders(),
      });

      expect(response.statusCode).toBe(400);
    });

    it("should filter files based on mimetype", async () => {
      const pngForm = await buildFormData([
        { name: "file", content: createFileBuffer(), filename: "img.png", mimetype: "image/png" },
      ]);
      const txtForm = await buildFormData([
        { name: "file", content: createFileBuffer(), filename: "doc.txt", mimetype: "text/plain" },
      ]);

      const pngResponse = await app.inject({
        method: "POST",
        url: "/filtered",
        payload: pngForm.getBuffer(),
        headers: pngForm.getHeaders(),
      });

      const txtResponse = await app.inject({
        method: "POST",
        url: "/filtered",
        payload: txtForm.getBuffer(),
        headers: txtForm.getHeaders(),
      });

      expect(JSON.parse(pngResponse.body).received).toBe(true);
      expect(JSON.parse(txtResponse.body).received).toBe(false);
    });
  });

  // ─── FilesInterceptor ─────────────────────────────────────────────────────

  describe("FilesInterceptor", () => {
    it("should upload multiple files in the same field", async () => {
      const form = new FormData();
      form.append("files", createFileBuffer("file 1"), { filename: "a.txt" });
      form.append("files", createFileBuffer("file 2"), { filename: "b.txt" });

      const response = await app.inject({
        method: "POST",
        url: "/multiple",
        payload: form.getBuffer(),
        headers: form.getHeaders(),
      });

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.body).count).toBe(2);
    });

    it("should return 400 when maxCount is exceeded", async () => {
      const form = new FormData();
      for (let i = 0; i < 4; i++) {
        form.append("files", createFileBuffer(`file ${i}`), { filename: `f${i}.txt` });
      }

      const response = await app.inject({
        method: "POST",
        url: "/multiple",
        payload: form.getBuffer(),
        headers: form.getHeaders(),
      });

      expect(response.statusCode).toBe(400);
    });

    it("should return 0 files when none uploaded", async () => {
      const form = new FormData();
      form.append("other", "value");

      const response = await app.inject({
        method: "POST",
        url: "/multiple",
        payload: form.getBuffer(),
        headers: form.getHeaders(),
      });

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.body).count).toBe(0);
    });
  });

  // ─── FileFieldsInterceptor ────────────────────────────────────────────────

  describe("FileFieldsInterceptor", () => {
    it("should group files by field name", async () => {
      const form = new FormData();
      form.append("avatar", createFileBuffer("avatar"), { filename: "avatar.png" });
      form.append("gallery", createFileBuffer("img1"), { filename: "img1.jpg" });
      form.append("gallery", createFileBuffer("img2"), { filename: "img2.jpg" });

      const response = await app.inject({
        method: "POST",
        url: "/fields",
        payload: form.getBuffer(),
        headers: form.getHeaders(),
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.avatar).toBe(1);
      expect(body.gallery).toBe(2);
    });

    it("should return 400 for unknown field", async () => {
      const form = await buildFormData([
        { name: "unknown", content: createFileBuffer(), filename: "x.txt" },
      ]);

      const response = await app.inject({
        method: "POST",
        url: "/fields",
        payload: form.getBuffer(),
        headers: form.getHeaders(),
      });

      expect(response.statusCode).toBe(400);
    });

    it("should return 400 when field maxCount exceeded", async () => {
      const form = new FormData();
      form.append("avatar", createFileBuffer("a1"), { filename: "a1.png" });
      form.append("avatar", createFileBuffer("a2"), { filename: "a2.png" });

      const response = await app.inject({
        method: "POST",
        url: "/fields",
        payload: form.getBuffer(),
        headers: form.getHeaders(),
      });

      expect(response.statusCode).toBe(400);
    });
  });

  // ─── AnyFilesInterceptor ──────────────────────────────────────────────────

  describe("AnyFilesInterceptor", () => {
    it("should accept files from any field name", async () => {
      const form = new FormData();
      form.append("field1", createFileBuffer("f1"), { filename: "f1.txt" });
      form.append("field2", createFileBuffer("f2"), { filename: "f2.txt" });
      form.append("field3", createFileBuffer("f3"), { filename: "f3.txt" });

      const response = await app.inject({
        method: "POST",
        url: "/any",
        payload: form.getBuffer(),
        headers: form.getHeaders(),
      });

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.body).count).toBe(3);
    });

    it("should return 0 when no files are sent", async () => {
      const form = new FormData();
      form.append("text", "value");

      const response = await app.inject({
        method: "POST",
        url: "/any",
        payload: form.getBuffer(),
        headers: form.getHeaders(),
      });

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.body).count).toBe(0);
    });
  });
});
