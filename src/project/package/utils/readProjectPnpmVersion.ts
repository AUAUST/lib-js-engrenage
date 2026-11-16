import { find, toArray } from "@auaust/toolkit/array";

import type { PackageJson } from "#project/package/types/PackageJson";

/**
 * Reads the pnpm version or range the manifest's `devEngines.packageManager`
 * declares, else the part after `pnpm@` in its `packageManager`, any `+hash`
 * suffix included; `undefined` when neither declares pnpm.
 */
export function readProjectPnpmVersion({
  optional,
}: PackageJson): string | undefined {
  const declared = find(
    toArray(optional.devEngines?.packageManager),
    ({ name }) => name === "pnpm",
  )?.version;

  return declared ?? /^pnpm@(.+)$/.exec(optional.packageManager ?? "")?.[1];
}
