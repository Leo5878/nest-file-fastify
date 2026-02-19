import { FastifyRequest } from "fastify";
import { UploadOptions } from "../options";
import { StorageFile } from "../../storage/storage";
export interface UploadField {
    /**
     * Field name
     */
    name: string;
    /**
     * Max number of files in this field
     */
    maxCount?: number;
}
export type UploadFieldMapEntry = Required<Pick<UploadField, "maxCount">>;
export declare const uploadFieldsToMap: (uploadFields: UploadField[]) => Map<string, Required<Pick<UploadField, "maxCount">>>;
export declare const handleMultipartFileFields: (req: FastifyRequest, fieldsMap: Map<string, UploadFieldMapEntry>, options: UploadOptions) => Promise<{
    body: Record<string, any>;
    files: Record<string, StorageFile[]>;
    remove: () => Promise<void>;
}>;
