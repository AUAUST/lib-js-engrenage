import { parseMajorVersion } from "#support/packageJson/utils/parseMajorVersion";

import manifest from "#package.json" with { type: "json" };

export function readSharedPnpmMajor(): number {
  const major = parseMajorVersion(manifest.devEngines.packageManager.version);

  if (major === undefined) {
    throw new Error("The bundled package.json declares no pnpm major");
  }

  return major;
}
