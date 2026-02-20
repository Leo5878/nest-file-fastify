"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockFilePart = createMockFilePart;
exports.createMockFieldPart = createMockFieldPart;
exports.createPartsIterator = createPartsIterator;
exports.createMockRequest = createMockRequest;
exports.createNonMultipartRequest = createNonMultipartRequest;
exports.createMockContext = createMockContext;
exports.createMockCallHandler = createMockCallHandler;
const stream_1 = require("stream");
/**
 * Creates a mock multipart file part
 */
function createMockFilePart(options) {
    const content = options.content instanceof Buffer
        ? options.content
        : Buffer.from(options.content ?? "test file content");
    const stream = stream_1.Readable.from(content);
    stream.truncated = false;
    return {
        type: "file",
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
function createMockFieldPart(fieldname, value) {
    return {
        type: "field",
        fieldname,
        value,
        file: undefined,
    };
}
/**
 * Creates an async iterator from an array of parts
 */
async function* createPartsIterator(parts) {
    for (const part of parts) {
        yield part;
    }
}
/**
 * Creates a mock FastifyRequest with multipart support
 */
function createMockRequest(parts = []) {
    return {
        isMultipart: () => true,
        parts: () => createPartsIterator(parts),
        body: {},
        storageFile: undefined,
        storageFiles: undefined,
    };
}
/**
 * Creates a mock non-multipart FastifyRequest
 */
function createNonMultipartRequest() {
    return {
        isMultipart: () => false,
        parts: () => createPartsIterator([]),
    };
}
/**
 * Creates a mock ExecutionContext
 */
function createMockContext(req) {
    return {
        switchToHttp: () => ({
            getRequest: () => req,
        }),
    };
}
/**
 * Creates a mock CallHandler that returns an Observable completing immediately
 */
function createMockCallHandler() {
    const { of } = require("rxjs");
    return {
        handle: () => of(null),
    };
}
//# sourceMappingURL=helpers.js.map