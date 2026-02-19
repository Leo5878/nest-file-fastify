import { HttpArgumentsHost } from "@nestjs/common/interfaces";
import { FastifyRequest } from "fastify";
import { RouteGenericInterface } from "fastify/types/route";
import { IncomingMessage, Server } from "http";
import { UploadOptions } from "../multipart/options";
import { StorageFile } from "../storage";
import { MultipartFile } from "./file";
export type FastifyMultipartRequest = FastifyRequest<RouteGenericInterface, Server, IncomingMessage> & {
    storageFile?: StorageFile;
    storageFiles?: StorageFile[] | Record<string, StorageFile[]>;
};
export declare const getMultipartRequest: (ctx: HttpArgumentsHost) => FastifyMultipartRequest;
export declare const getParts: (req: FastifyRequest, options: UploadOptions) => MultipartsIterator;
export type MultipartsIterator = AsyncIterableIterator<MultipartFile>;
