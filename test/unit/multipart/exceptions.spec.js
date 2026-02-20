"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const exceptions_1 = require("../../../src/multipart/exceptions");
describe("transformException", () => {
    it("should return undefined when error is undefined", () => {
        expect((0, exceptions_1.transformException)(undefined)).toBeUndefined();
    });
    it("should return HttpException as-is without transformation", () => {
        const err = new common_1.HttpException("test", 400);
        expect((0, exceptions_1.transformException)(err)).toBe(err);
    });
    it("should return BadRequestException as-is (it extends HttpException)", () => {
        const err = new common_1.BadRequestException("bad request");
        expect((0, exceptions_1.transformException)(err)).toBe(err);
    });
    it("should transform FST_REQ_FILE_TOO_LARGE to PayloadTooLargeException", () => {
        const err = Object.assign(new Error("file too large"), {
            code: "FST_REQ_FILE_TOO_LARGE",
        });
        const result = (0, exceptions_1.transformException)(err);
        expect(result).toBeInstanceOf(common_1.PayloadTooLargeException);
    });
    it("should transform FST_PARTS_LIMIT to BadRequestException", () => {
        const err = Object.assign(new Error("parts limit"), {
            code: "FST_PARTS_LIMIT",
        });
        const result = (0, exceptions_1.transformException)(err);
        expect(result).toBeInstanceOf(common_1.BadRequestException);
    });
    it("should transform FST_FILES_LIMIT to BadRequestException", () => {
        const err = Object.assign(new Error("files limit"), {
            code: "FST_FILES_LIMIT",
        });
        const result = (0, exceptions_1.transformException)(err);
        expect(result).toBeInstanceOf(common_1.BadRequestException);
    });
    it("should transform FST_PROTO_VIOLATION to BadRequestException", () => {
        const err = Object.assign(new Error("proto violation"), {
            code: "FST_PROTO_VIOLATION",
        });
        const result = (0, exceptions_1.transformException)(err);
        expect(result).toBeInstanceOf(common_1.BadRequestException);
    });
    it("should transform FST_INVALID_MULTIPART_CONTENT_TYPE to BadRequestException", () => {
        const err = Object.assign(new Error("invalid content type"), {
            code: "FST_INVALID_MULTIPART_CONTENT_TYPE",
        });
        const result = (0, exceptions_1.transformException)(err);
        expect(result).toBeInstanceOf(common_1.BadRequestException);
    });
    it("should return unknown errors as-is", () => {
        const err = Object.assign(new Error("unknown error"), {
            code: "SOME_UNKNOWN_CODE",
        });
        const result = (0, exceptions_1.transformException)(err);
        expect(result).toBe(err);
    });
    it("should return plain Error without code as-is", () => {
        const err = new Error("generic error");
        const result = (0, exceptions_1.transformException)(err);
        expect(result).toBe(err);
    });
});
//# sourceMappingURL=exceptions.spec.js.map