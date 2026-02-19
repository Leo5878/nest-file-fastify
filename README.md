<div align="left">
  <h1> fastify-multipart for Nest.js</h1>

[![Github Actions](https://img.shields.io/github/workflow/status/blazity/nest-file-fastify/Build?style=flat-square)](https://github.com/Blazity/nest-file-fastify)
[![NPM](https://img.shields.io/npm/v/@blazity/nest-file-fastify.svg?style=flat-square)](https://www.npmjs.com/package/@blazity/nest-file-fastify)
[![NPM](https://img.shields.io/npm/dm/@blazity/nest-file-fastify?style=flat-square)](https://www.npmjs.com/package/@blazity/nest-file-fastify)

</div>

This library adds decorators for [Nest.js](https://github.com/nestjs/nest) to support [@fastify/multipart](https://github.com/fastify/fastify-multipart). The API is very similar to the official Nest.js Express file decorators.

## Changes from original

**Dependency update & deprecated package replacement (from PR [#9](https://github.com/Blazity/nest-file-fastify/pull/9))**
- Replaced deprecated `fastify-multipart` with the official `@fastify/multipart` package to ensure compatibility with current versions of Fastify.
- Updated project dependencies to improve overall stability and security.
- Files that are not saved to disk now also return a unique `filename`.
- Introduced new `UploadedFile` type with a `filename` field.
- File upload size limit in tests set to 5MB.

**Additional improvements**
- Removed `util.promisify` wrapping — the new version of `@fastify/multipart` natively supports `async/await`, which allowed simplifying the interceptors code.
- Updated the demo application in the `example/` folder to match the new API.
- Minor fixes for types, exports and edge cases.

## Installation

NPM

```bash
$ npm install @blazity/nest-file-fastify @fastify/multipart
```

Yarn

```bash
$ yarn add @blazity/nest-file-fastify @fastify/multipart
```

and register multpart plugin in your Nest.js application

```typescript
import fastyfyMultipart from '@fastify/multipart';

...

app.register(fastyfyMultipart);
```

## Docs

### Single file

```ts
import { FileInterceptor, UploadedFile, MemoryStorageFile } from '@blazity/nest-file-fastify';

@Post('upload')
@UseInterceptors(FileInterceptor('file'))
uploadFile(@UploadedFile() file: MemoryStorageFile) {
  console.log(file);
}
```

`FileInterceptor` arguments:

- `fieldname`: string - name of the field that holds a file

- `options`: optional object of type [`UploadOptions`](src/multipart/options.ts#L4)

### Array of files

```ts
import { FilesInterceptor, UploadedFiles, MemoryStorageFile } from '@blazity/nest-file-fastify';

@Post('upload')
@UseInterceptors(FilesInterceptor('files'))
uploadFile(@UploadedFiles() files: MemoryStorageFile[]) {
  console.log(files);
}
```

`FilesInterceptor` arguments:

- `fieldname`: string - name of the field that holds files

- `maxCount`: optional number - maximum number of files to accept

- `options`: optional object of type [`UploadOptions`](src/multipart/options.ts#L4)

### Multiple files

```ts
import { FileFieldsInterceptor, UploadedFiles, MemoryStorageFile } from '@blazity/nest-file-fastify';

@Post('upload')
@UseInterceptors(FileFieldsInterceptor([
  { name: 'avatar', maxCount: 1 },
  { name: 'background', maxCount: 1 },
]))
uploadFile(@UploadedFiles() files: { avatar?: MemoryStorageFile[], background?: MemoryStorageFile[] }) {
  console.log(files);
}
```

`FileFieldsInterceptor` arguments:

- `uploadFields`: object of type [`UploadField`](src/multipart/handlers/file-fields.ts#L10)

- `options`: optional object of type [`UploadOptions`](src/multipart/options.ts#L4)

### Any files

```ts
import { AnyFilesInterceptor, UploadedFiles, MemoryStorageFile } from '@blazity/nest-file-fastify';

@Post('upload')
@UseInterceptors(AnyFilesInterceptor()
uploadFile(@UploadedFiles() files: MemoryStorageFile[]) {
  console.log(files);
}
```

`AnyFilesInterceptor` arguments:

- `options`: optional object of type [`UploadOptions`](src/multipart/options.ts#L4)
