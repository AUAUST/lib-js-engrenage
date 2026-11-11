import type { createFilesystem } from "#foundation/filesystem/operations/createFilesystem";

/** @experimental */
export interface Filesystem extends ReturnType<typeof createFilesystem> {}
