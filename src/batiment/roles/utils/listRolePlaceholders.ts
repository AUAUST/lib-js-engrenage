import { isString } from "@auaust/toolkit";
import { toArray } from "@auaust/toolkit/array";

import { rolePlaceholderPattern } from "#batiment/roles/constants";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

export function listRolePlaceholders(globs: Glob | Globs): string[] {
  return toArray(globs).flatMap((glob) => {
    const matches = glob.matchAll(new RegExp(rolePlaceholderPattern, "g"));

    return [...matches].map((match) => match[1]).filter(isString);
  });
}
