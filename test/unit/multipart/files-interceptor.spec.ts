import { FilesInterceptor } from "../../../src/interceptors/files-interceptor";
import { MemoryStorage } from "../../../src/storage/memory-storage";
import {
  createMockFilePart,
  createMockFieldPart,
  createMockContext,
  createMockCallHandler,
  createPartsIterator,
} from "../../helpers";

function buildRequest(parts: any[]) {
  return {
    isMultipart: () => true,
    parts: () => createPartsIterator(parts),
    body: {} as any,
    storageFiles: undefined as any,
  } as any;
}

function buildOptions() {
  return { storage: new MemoryStorage() };
}

describe("FilesInterceptor", () => {
  it("should create an interceptor class", () => {
    const Interceptor = FilesInterceptor("files", 3, buildOptions());
    expect(Interceptor).toBeDefined();
    const instance = new Interceptor();
    expect(instance).toBeInstanceOf(Interceptor);
  });

  it("should use default maxCount of 1 when not provided", async () => {
    // exercises the `maxCount = 1` default parameter branch
    const Interceptor = FilesInterceptor("files", undefined as any, buildOptions());
    const instance = new Interceptor();

    const filePart = createMockFilePart({ fieldname: "files" });
    const req = buildRequest([filePart]);
    const ctx = createMockContext(req);
    const next = createMockCallHandler();

    await instance.intercept(ctx, next);

    expect(req.storageFiles).toHaveLength(1);
  });

  it("should set storageFiles on the request", async () => {
    const Interceptor = FilesInterceptor("photos", 5, buildOptions());
    const instance = new Interceptor();

    const parts = [
      createMockFilePart({ fieldname: "photos", filename: "a.jpg" }),
      createMockFilePart({ fieldname: "photos", filename: "b.jpg" }),
    ];
    const req = buildRequest(parts);
    const ctx = createMockContext(req);
    const next = createMockCallHandler();

    await instance.intercept(ctx, next);

    expect(req.storageFiles).toHaveLength(2);
  });

  it("should set body fields on the request", async () => {
    const Interceptor = FilesInterceptor("file", 1, buildOptions());
    const instance = new Interceptor();

    const parts = [
      createMockFieldPart("title", "hello"),
      createMockFilePart({ fieldname: "file" }),
    ];
    const req = buildRequest(parts);
    const ctx = createMockContext(req);
    const next = createMockCallHandler();

    await instance.intercept(ctx, next);

    expect(req.body.title).toBe("hello");
  });

  it("should work without options (uses default storage)", async () => {
    // no options passed at all
    const Interceptor = FilesInterceptor("file");
    const instance = new Interceptor();

    const req = buildRequest([createMockFilePart({ fieldname: "file" })]);
    const ctx = createMockContext(req);
    const next = createMockCallHandler();

    await instance.intercept(ctx, next);

    expect(req.storageFiles).toHaveLength(1);
  });
});
