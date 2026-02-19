import { NestInterceptor, Type } from "@nestjs/common";
import { UploadOptions } from "../multipart/options";
export declare function AnyFilesInterceptor(options?: UploadOptions): Type<NestInterceptor>;
