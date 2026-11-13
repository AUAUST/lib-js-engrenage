import { readDeclaredVersion } from "#project/package/utils/readDeclaredVersion";

import manifest from "#package.json" with { type: "json" };

/**
 * Reads the pnpm range engrenage's own manifest requires, with the version it
 * starts from as `floor`. Throws when the range is not one version optionally
 * prefixed with `^`, `~` or `=`.
 */
export function readSharedPnpmRange(): {
  range: string;
  floor: string;
} {
  const range = manifest.devEngines.packageManager.version;

  const floor = readDeclaredVersion(range);

  if (floor === undefined) {
    throw new Error(
      `The bundled package.json declares no plain pnpm range: ${range}`,
    );
  }

  return { range, floor };
}
