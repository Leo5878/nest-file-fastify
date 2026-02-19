import { Readable } from "stream";

/**
 * Creates a mock multipart file part
 */
export function createMockFilePart(options: {
  fieldname?: string;
  filename?: string;
  mimetype?: string;
  encoding?: string;
  content?: Buffer | string;
}) {
  const content =
    options.content instanceof Buffer
      ? options.content
      : Buffer.from(options.content ?? "test file content");

  const stream = Readable.from(content) as Readable & { truncated?: boolean };
  stream.truncated = false;

  return {
    type: "file" as const,
    file: stream,
    fieldname: options.fieldname ?? "file",
    filename: options.filename ?? "test.txt",
    mimetype: options.mimetype ?? "text/plain",
    encoding: options.encoding ?? "7bit",
    toBuffer: async () => content,
  };
}

/**
 * Creates a mock text (non-file) part
 */
export function createMockFieldPart(fieldname: string, value: string) {
  return {
    type: "field" as const,
    fieldname,
    value,
    file: undefined,
  };
}

/**
 * Creates an async iterator from an array of parts
 */
export async function* createPartsIterator(parts: any[]) {
  for (const part of parts) {
    yield part;
  }
}

/**
 * Creates a mock FastifyRequest with multipart support
 */
export function createMockRequest(parts: any[] = []) {
  return {
    isMultipart: () => true,
    parts: () => createPartsIterator(parts),
    body: {} as any,
    storageFile: undefined as any,
    storageFiles: undefined as any,
  } as any;
}

/**
 * Creates a mock non-multipart FastifyRequest
 */
export function createNonMultipartRequest() {
  return {
    isMultipart: () => false,
    parts: () => createPartsIterator([]),
  } as any;
}

/**
 * Creates a mock ExecutionContext
 */
export function createMockContext(req: any) {
  return {
    switchToHttp: () => ({
      getRequest: () => req,
    }),
  } as any;
}

/**
 * Creates a mock CallHandler that returns an Observable completing immediately
 */
export function createMockCallHandler() {
  const { of } = require("rxjs");
  return {
    handle: () => of(null),
  };
}
