import {
  BadRequestException,
  HttpException,
  PayloadTooLargeException,
} from "@nestjs/common";
import { transformException } from "../../../src/multipart/exceptions";

describe("transformException", () => {
  it("should return undefined when error is undefined", () => {
    expect(transformException(undefined)).toBeUndefined();
  });

  it("should return HttpException as-is without transformation", () => {
    const err = new HttpException("test", 400);
    expect(transformException(err)).toBe(err);
  });

  it("should return BadRequestException as-is (it extends HttpException)", () => {
    const err = new BadRequestException("bad request");
    expect(transformException(err)).toBe(err);
  });

  it("should transform FST_REQ_FILE_TOO_LARGE to PayloadTooLargeException", () => {
    const err = Object.assign(new Error("file too large"), {
      code: "FST_REQ_FILE_TOO_LARGE",
    });
    const result = transformException(err);
    expect(result).toBeInstanceOf(PayloadTooLargeException);
  });

  it("should transform FST_PARTS_LIMIT to BadRequestException", () => {
    const err = Object.assign(new Error("parts limit"), {
      code: "FST_PARTS_LIMIT",
    });
    const result = transformException(err);
    expect(result).toBeInstanceOf(BadRequestException);
  });

  it("should transform FST_FILES_LIMIT to BadRequestException", () => {
    const err = Object.assign(new Error("files limit"), {
      code: "FST_FILES_LIMIT",
    });
    const result = transformException(err);
    expect(result).toBeInstanceOf(BadRequestException);
  });

  it("should transform FST_PROTO_VIOLATION to BadRequestException", () => {
    const err = Object.assign(new Error("proto violation"), {
      code: "FST_PROTO_VIOLATION",
    });
    const result = transformException(err);
    expect(result).toBeInstanceOf(BadRequestException);
  });

  it("should transform FST_INVALID_MULTIPART_CONTENT_TYPE to BadRequestException", () => {
    const err = Object.assign(new Error("invalid content type"), {
      code: "FST_INVALID_MULTIPART_CONTENT_TYPE",
    });
    const result = transformException(err);
    expect(result).toBeInstanceOf(BadRequestException);
  });

  it("should return unknown errors as-is", () => {
    const err = Object.assign(new Error("unknown error"), {
      code: "SOME_UNKNOWN_CODE",
    });
    const result = transformException(err);
    expect(result).toBe(err);
  });

  it("should return plain Error without code as-is", () => {
    const err = new Error("generic error");
    const result = transformException(err);
    expect(result).toBe(err);
  });
});
