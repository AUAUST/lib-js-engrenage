import { flatMap } from "@auaust/primitive-kit/arrays";
import { entries } from "@auaust/toolkit/object";

import { listStaticFileGlobs } from "#project/structure/utils/listStaticFileGlobs";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { Globs } from "#types/Globs";

export function listDiscoveredGlobs({ roles }: ResolvedRoles): Globs {
  return flatMap(entries(roles), ([name, { discovered, file }]) => {
    if (!discovered) {
      return [];
    }

    return file === undefined
      ? [`**/${name}/**`]
      : listStaticFileGlobs(file).map((glob) => `**/${glob}`);
  });
}
