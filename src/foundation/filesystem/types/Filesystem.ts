import type { createFilesystem } from "#filesystem/utils/createFilesystem";

export interface Filesystem extends ReturnType<typeof createFilesystem> {}
