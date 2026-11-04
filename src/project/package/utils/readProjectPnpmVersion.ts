import { find, wrap } from "@auaust/primitive-kit/arrays";

import type { PackageJson } from "#package/types/PackageJson";

export function readProjectPnpmVersion({
  optional,
}: PackageJson): string | undefined {
  const declared = find(
    wrap(optional.devEngines?.packageManager),
    ({ name }) => name === "pnpm",
  )?.version;

  return declared ?? /^pnpm@(.+)$/.exec(optional.packageManager ?? "")?.[1];
}
