import { posix } from "node:path";

import type { Alias } from "#project/structure/types/Alias";

export function getAliasSpecifier(aliases: readonly Alias[], path: string) {
  for (const { key, target } of aliases) {
    const normalized = posix.normalize(target);
    const star = normalized.indexOf("*");
    const keyStar = key.indexOf("*");

    if (star === -1 || keyStar === -1) {
      if (star === -1 && keyStar === -1 && normalized === path) {
        return key;
      }

      continue;
    }

    const prefix = normalized.slice(0, star);
    const suffix = normalized.slice(star + 1);

    if (
      path.startsWith(prefix) &&
      path.endsWith(suffix) &&
      path.length >= prefix.length + suffix.length
    ) {
      return key.replace("*", () => {
        return path.slice(prefix.length, path.length - suffix.length);
      });
    }
  }
}
