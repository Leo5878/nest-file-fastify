import { NestInterceptor, Type } from "@nestjs/common";
import { UploadOptions } from "../multipart/options";
export declare function FileInterceptor(fieldname: string, options?: UploadOptions): Type<NestInterceptor>;
