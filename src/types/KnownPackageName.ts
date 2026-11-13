import type { packages } from "#constants";

/**
 * A package name from engrenage's own catalog of the packages it references.
 */
export type KnownPackageName = (typeof packages)[keyof typeof packages];
