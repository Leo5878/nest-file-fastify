import busboy from "busboy";
import { DiskStorage, Storage } from "../storage";
import { UploadFilterHandler } from "./filter";
export type UploadOptions = busboy.BusboyConfig & {
    dest?: string;
    storage?: Storage;
    filter?: UploadFilterHandler;
};
export declare const DEFAULT_UPLOAD_OPTIONS: Partial<UploadOptions>;
export declare const transformUploadOptions: (opts?: UploadOptions) => Partial<UploadOptions> | {
    storage: DiskStorage;
    headers?: import("node:http").IncomingHttpHeaders | undefined;
    highWaterMark?: number | undefined;
    fileHwm?: number | undefined;
    defCharset?: string | undefined;
    defParamCharset?: string | undefined;
    preservePath?: boolean | undefined;
    limits?: busboy.Limits | undefined;
    dest?: string;
    filter?: UploadFilterHandler;
};
