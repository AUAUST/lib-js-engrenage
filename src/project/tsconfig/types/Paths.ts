import type { Globs } from "#types/Globs";

/**
 * A tsconfig `compilerOptions.paths` map: each specifier, possibly holding one
 * `*`, mapped to the files it targets, in lookup order.
 */
export type Paths = Record<string, Globs>;
