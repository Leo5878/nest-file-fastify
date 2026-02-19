import { NestInterceptor, Type } from "@nestjs/common";
import { UploadOptions } from "../multipart/options";
import { UploadField } from "../multipart/handlers/file-fields";
export declare function FileFieldsInterceptor(uploadFields: UploadField[], options?: UploadOptions): Type<NestInterceptor>;
