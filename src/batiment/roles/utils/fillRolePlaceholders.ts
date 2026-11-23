import { toArray } from "@auaust/toolkit/array";
import { getOwn } from "@auaust/toolkit/object";
import { pascal, uncapitalize } from "@auaust/toolkit/string";

import { rolePlaceholderPattern } from "#batiment/roles/constants";
import type { RoleLocation } from "#batiment/roles/types/RoleLocation";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

export function fillRolePlaceholders(
  globs: Glob | Globs,
  location: RoleLocation,
  module?: string,
): Globs {
  const values = {
    domain: location.lineage.at(-1)?.name,
    name: module,
  };

  return toArray(globs).map((glob) => {
    return glob.replaceAll(
      new RegExp(rolePlaceholderPattern, "g"),
      (placeholder, name: string) => {
        const value = getOwn(values, uncapitalize(name));

        if (value === undefined) {
          throw new Error(
            `The role glob ${glob} has no value for ${placeholder} here`,
          );
        }

        return name === uncapitalize(name) ? value : pascal(value);
      },
    );
  });
}
