import { FastifyRequest } from "fastify";
import { UploadOptions } from "../options";
import { StorageFile } from "../../storage";
export declare const handleMultipartAnyFiles: (req: FastifyRequest, options: UploadOptions) => Promise<{
    body: Record<string, any>;
    files: StorageFile[];
    remove: () => Promise<void>;
}>;
