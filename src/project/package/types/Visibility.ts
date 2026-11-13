import type { visibilities } from "#project/package/constants";

/**
 * Who may install the published package: `public` for anyone, `private` for
 * members of its scope.
 */
export type Visibility = (typeof visibilities)[number];
