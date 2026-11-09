import type { Version } from "#project/package/types/Version";

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
