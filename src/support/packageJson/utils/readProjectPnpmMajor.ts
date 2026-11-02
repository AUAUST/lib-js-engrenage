import { find, wrap } from "@auaust/primitive-kit/arrays";

import { parseMajorVersion } from "#support/packageJson/utils/parseMajorVersion";
import type { PackageJson } from "#support/packageJson/types/PackageJson";

export function readProjectPnpmMajor({
  optional,
}: PackageJson): number | undefined {
  const declared = find(
    wrap(optional.devEngines?.packageManager),
    ({ name }) => name === "pnpm",
  )?.version;

  if (declared !== undefined) {
    return parseMajorVersion(declared);
  }

  const legacy = /^pnpm@(.+)$/.exec(optional.packageManager ?? "")?.[1];

  return legacy === undefined ? undefined : parseMajorVersion(legacy);
}
