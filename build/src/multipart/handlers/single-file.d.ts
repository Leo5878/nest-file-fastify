import { FastifyRequest } from "fastify";
import { UploadOptions } from "../options";
import { StorageFile } from "../../storage";
export declare const handleMultipartSingleFile: (req: FastifyRequest, fieldname: string, options: UploadOptions) => Promise<{
    body: Record<string, any>;
    file: StorageFile | undefined;
    remove: () => Promise<void>;
}>;
