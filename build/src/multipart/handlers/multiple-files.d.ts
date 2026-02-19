import { FastifyRequest } from "fastify";
import { UploadOptions } from "../options";
import { StorageFile } from "../../storage";
export declare const handleMultipartMultipleFiles: (req: FastifyRequest, fieldname: string, maxCount: number, options: UploadOptions) => Promise<{
    body: Record<string, any>;
    files: StorageFile[];
    remove: () => Promise<void>;
}>;
