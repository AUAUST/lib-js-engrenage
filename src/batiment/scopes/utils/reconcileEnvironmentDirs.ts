import { entries, getOwn } from "@auaust/toolkit/object";

import type { EnvironmentClaim } from "#batiment/scopes/ports/EnvironmentClaim";
import type { Directories } from "#types/Directories";

export function reconcileEnvironmentDirs(
  name: string,
  dirs: Directories,
  claims: Readonly<Record<string, EnvironmentClaim>>,
): Directories {
  if (getOwn(claims, name)?.dirs !== undefined) {
    return dirs;
  }

  const claimed = new Set(
    entries(claims).flatMap(([owner, claim]) => {
      return owner === name ? [] : [...claim.owns, ...claim.named];
    }),
  );

  return dirs.filter((directory) => !claimed.has(directory));
}
