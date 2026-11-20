import type { packages } from "#constants";

// @debt a domain contract held as a global type; belongs to the lowest domain owning it
/**
 * A package name from engrenage's own catalog of the packages it references.
 */
export type KnownPackageName = (typeof packages)[keyof typeof packages];
