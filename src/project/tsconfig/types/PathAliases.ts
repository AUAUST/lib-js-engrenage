import type { PathAlias } from "#project/tsconfig/types/PathAlias";

/**
 * The aliases `resolvePathAliases` expands, at most one per specifier and per
 * entry name.
 */
export type PathAliases = readonly PathAlias[];
