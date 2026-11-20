import { flatMap } from "@auaust/toolkit/array";
import { entries } from "@auaust/toolkit/object";

import { listStaticFileGlobs } from "#batiment/roles/utils/listStaticFileGlobs";
import type { ResolvedRoles } from "#batiment/roles/types/ResolvedRoles";
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
