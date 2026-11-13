/**
 * The numeric core of a version; prerelease and build metadata are dropped.
 */
export interface Version {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
}
