import { NestInterceptor, Type } from "@nestjs/common";
import { UploadOptions } from "../multipart/options";
export declare function FilesInterceptor(fieldname: string, maxCount?: number, options?: UploadOptions): Type<NestInterceptor>;
