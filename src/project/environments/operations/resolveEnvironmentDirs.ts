import { entries, getOwn } from "@auaust/toolkit/object";

import type { ConfigResolver } from "#project/config/index";
import type { Directories } from "#types/Directories";

export async function resolveEnvironmentDirs(
  config: ConfigResolver,
  name: string,
  dirs: Directories,
): Promise<Directories> {
  const claims = await config.resolve("environments.claims");

  if (getOwn(claims, name)?.dirs !== undefined) {
    return dirs;
  }

  const claimed = new Set(
    entries(claims).flatMap(([owner, claim]) => {
      return owner === name ? [] : [...claim.owns, ...(claim.dirs ?? [])];
    }),
  );

  return dirs.filter((directory) => !claimed.has(directory));
}
