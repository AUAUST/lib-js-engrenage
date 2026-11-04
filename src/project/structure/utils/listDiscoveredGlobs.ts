import { flatMap, wrap } from "@auaust/primitive-kit/arrays";
import { entries } from "@auaust/toolkit/object";

import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { Globs } from "#types/Globs";

export function listDiscoveredGlobs({ roles }: ResolvedRoles): Globs {
  return flatMap(entries(roles), ([name, { discovered, file }]) => {
    if (!discovered) {
      return [];
    }

    return file === undefined
      ? [`**/${name}/**`]
      : wrap(file).map((glob) => `**/${glob}`);
  });
}
