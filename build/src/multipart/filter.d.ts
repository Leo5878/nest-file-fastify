import { FastifyRequest } from "fastify";
import { UploadOptions } from ".";
import { DiskStorageFile, MemoryStorageFile, StorageFile } from "../storage";
export type UploadFilterFile = DiskStorageFile | MemoryStorageFile | StorageFile;
export type UploadFilterHandler = (req: FastifyRequest, file: UploadFilterFile) => Promise<boolean | string> | boolean | string;
export declare const filterUpload: (uploadOptions: UploadOptions, req: FastifyRequest, file: UploadFilterFile) => Promise<boolean>;
