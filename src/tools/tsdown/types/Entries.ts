import type { File } from "#types/File";

/**
 * Source file of each build entry, by output name.
 */
export type Entries = Record<string, File>;
