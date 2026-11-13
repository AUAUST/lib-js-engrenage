/**
 * An npm package name, scoped or not.
 */
export type PackageName = (string & {}) | `@${string}/${string}`;
