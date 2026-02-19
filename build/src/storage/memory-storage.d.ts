import { FastifyRequest } from "fastify";
import { MultipartFile } from "@fastify/multipart";
import { RouteGenericInterface } from "fastify/types/route";
import { Server, IncomingMessage } from "http";
import { StorageFile, Storage } from "./storage";
export interface MemoryStorageFile extends StorageFile {
    buffer: Buffer;
}
export declare class MemoryStorage implements Storage<MemoryStorageFile> {
    handleFile(file: MultipartFile, req: FastifyRequest<RouteGenericInterface, Server, IncomingMessage>): Promise<{
        buffer: Buffer<ArrayBufferLike>;
        size: number;
        encoding: string;
        mimetype: string;
        fieldname: string;
        filename: string;
        originalFilename: string;
    }>;
    removeFile(file: MemoryStorageFile): Promise<void>;
}
