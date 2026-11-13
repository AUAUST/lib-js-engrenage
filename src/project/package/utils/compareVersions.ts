import { parseVersion } from "#project/package/utils/parseVersion";

/**
 * Compares the versions `parseVersion` reads from `a` and `b` by major, minor
 * then patch: negative when `a` is lower, zero when equal, positive when higher.
 * Throws when either holds no version.
 */
export function compareVersions(a: string, b: string): number {
  const first = parseVersion(a);
  const second = parseVersion(b);

  if (first === undefined || second === undefined) {
    throw new Error(`Cannot compare ${a} with ${b}: one has no version`);
  }

  return (
    first.major - second.major ||
    first.minor - second.minor ||
    first.patch - second.patch
  );
}
