import type { Version } from "#project/package/types/Version";

/**
 * Reads the first `major[.minor[.patch]]` found anywhere in `specifier`, a
 * missing minor or patch counting as 0, so `^9.1` reads as 9.1.0; `undefined`
 * when `specifier` holds no digit.
 */
export function parseVersion(specifier: string): Version | undefined {
  const match = /(\d+)(?:\.(\d+))?(?:\.(\d+))?/.exec(specifier);

  if (match === null) {
    return;
  }

  const [, major, minor = "0", patch = "0"] = match;

  return {
    major: Number(major),
    minor: Number(minor),
    patch: Number(patch),
  };
}
