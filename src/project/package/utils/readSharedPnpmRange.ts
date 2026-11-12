import { readDeclaredVersion } from "#project/package/utils/readDeclaredVersion";

import manifest from "#package.json" with { type: "json" };

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
