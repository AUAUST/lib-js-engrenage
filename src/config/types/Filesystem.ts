import type { createFilesystem } from "#config/utils/createFilesystem";

export interface Filesystem extends ReturnType<typeof createFilesystem> {}
