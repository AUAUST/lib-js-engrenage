import type { publishAccess } from "#project/package/constants";

/**
 * The manifest's `publishConfig.access`: `public` for a public visibility,
 * `restricted` for a private one.
 */
export type PublishAccess = (typeof publishAccess)[number];
