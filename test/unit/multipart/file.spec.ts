import { removeStorageFiles } from "../../../src/multipart/file";
import { MemoryStorage } from "../../../src/storage/memory-storage";
import { createMockFilePart, createMockRequest } from "../../helpers";

function buildStorage() {
  return new MemoryStorage();
}

async function storeFile(storage: MemoryStorage) {
  const part = createMockFilePart({ fieldname: "file", filename: "test.txt" });
  const req = createMockRequest();
  return storage.handleFile(part as any, req);
}

describe("removeStorageFiles", () => {
  it("should return early without error when files is undefined", async () => {
    const storage = buildStorage();
    await expect(
      removeStorageFiles(storage, undefined),
    ).resolves.toBeUndefined();
  });

  it("should return early without error when files is null", async () => {
    const storage = buildStorage();
    await expect(
      removeStorageFiles(storage, null as any),
    ).resolves.toBeUndefined();
  });

  it("should remove all provided files", async () => {
    const storage = buildStorage();
    const file1 = await storeFile(storage);
    const file2 = await storeFile(storage);

    const removeSpy = jest.spyOn(storage, "removeFile");

    await removeStorageFiles(storage, [file1, file2], true);

    expect(removeSpy).toHaveBeenCalledTimes(2);
    expect(removeSpy).toHaveBeenCalledWith(file1, true);
    expect(removeSpy).toHaveBeenCalledWith(file2, true);
  });

  it("should skip undefined entries in the files array", async () => {
    const storage = buildStorage();
    const file = await storeFile(storage);

    const removeSpy = jest.spyOn(storage, "removeFile");

    await removeStorageFiles(storage, [file, undefined], true);

    expect(removeSpy).toHaveBeenCalledTimes(1);
    expect(removeSpy).toHaveBeenCalledWith(file, true);
  });

  it("should call removeFile without force flag by default", async () => {
    const storage = buildStorage();
    const file = await storeFile(storage);

    const removeSpy = jest.spyOn(storage, "removeFile");

    await removeStorageFiles(storage, [file]);

    expect(removeSpy).toHaveBeenCalledWith(file, undefined);
  });
});
