import { MultipartFile as _MultipartFile } from "@fastify/multipart";
import { Readable } from "stream";
import { Storage, StorageFile } from "../storage";
export type MultipartFile = Omit<_MultipartFile, "file"> & {
    value?: unknown;
    file: Readable & {
        truncated?: boolean;
    };
};
export declare const removeStorageFiles: (storage: Storage, files?: (StorageFile | undefined)[], force?: boolean) => Promise<void>;
