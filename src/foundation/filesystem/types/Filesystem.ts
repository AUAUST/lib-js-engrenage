import type { createFilesystem } from "#filesystem/operations/createFilesystem";

export interface Filesystem extends ReturnType<typeof createFilesystem> {}
