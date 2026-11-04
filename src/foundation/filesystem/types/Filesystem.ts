import type { createFilesystem } from "#foundation/filesystem/operations/createFilesystem";

export interface Filesystem extends ReturnType<typeof createFilesystem> {}
