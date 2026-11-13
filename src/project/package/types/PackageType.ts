import type { packageTypes } from "#project/package/constants";

/**
 * The manifest's `type`: whether Node reads the package's `.js` files as ES
 * modules or CommonJS.
 */
export type PackageType = (typeof packageTypes)[number];
