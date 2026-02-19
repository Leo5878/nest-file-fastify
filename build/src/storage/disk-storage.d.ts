import { MultipartFile } from "@fastify/multipart";
import { FastifyRequest } from "fastify";
import { type Server, type IncomingMessage } from "http";
import type { RouteGenericInterface } from "fastify/types/route";
import { StorageFile, Storage } from "./storage";
export interface DiskStorageFile extends StorageFile {
    dest: string;
    filename: string;
    path: string;
}
type DiskStorageOptionHandler = ((file: MultipartFile, req: FastifyRequest) => Promise<string> | string) | string;
export interface DiskStorageOptions {
    dest?: DiskStorageOptionHandler;
    filename?: DiskStorageOptionHandler;
    removeAfter?: boolean;
}
export declare class DiskStorage implements Storage<DiskStorageFile, DiskStorageOptions> {
    readonly options?: DiskStorageOptions;
    constructor(options?: DiskStorageOptions);
    handleFile(file: MultipartFile, req: FastifyRequest<RouteGenericInterface, Server, IncomingMessage>): Promise<{
        size: number;
        dest: string;
        filename: string;
        originalFilename: string;
        path: string;
        mimetype: string;
        encoding: string;
        fieldname: string;
    }>;
    removeFile(file: DiskStorageFile, force?: boolean): Promise<void>;
    protected getFilename(file: MultipartFile, req: FastifyRequest, obj?: DiskStorageOptionHandler): Promise<string>;
    protected getFileDestination(file: MultipartFile, req: FastifyRequest, obj?: DiskStorageOptionHandler): Promise<string>;
}
export {};
