import { Readable } from "stream";
/**
 * Creates a mock multipart file part
 */
export declare function createMockFilePart(options: {
    fieldname?: string;
    filename?: string;
    mimetype?: string;
    encoding?: string;
    content?: Buffer | string;
}): {
    type: "file";
    file: Readable & {
        truncated?: boolean;
    };
    fieldname: string;
    filename: string;
    mimetype: string;
    encoding: string;
    toBuffer: () => Promise<Buffer<ArrayBufferLike>>;
};
/**
 * Creates a mock text (non-file) part
 */
export declare function createMockFieldPart(fieldname: string, value: string): {
    type: "field";
    fieldname: string;
    value: string;
    file: undefined;
};
/**
 * Creates an async iterator from an array of parts
 */
export declare function createPartsIterator(parts: any[]): AsyncGenerator<any, void, unknown>;
/**
 * Creates a mock FastifyRequest with multipart support
 */
export declare function createMockRequest(parts?: any[]): any;
/**
 * Creates a mock non-multipart FastifyRequest
 */
export declare function createNonMultipartRequest(): any;
/**
 * Creates a mock ExecutionContext
 */
export declare function createMockContext(req: any): any;
/**
 * Creates a mock CallHandler that returns an Observable completing immediately
 */
export declare function createMockCallHandler(): {
    handle: () => any;
};
