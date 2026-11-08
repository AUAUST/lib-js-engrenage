import { flatMap } from "@auaust/primitive-kit/arrays";
import { values } from "@auaust/toolkit/object";

import { collectStructureNodes } from "#project/structure/utils/collectStructureNodes";
import type { ResolvedStructure } from "#project/structure/types/ResolvedStructure";

export function listDomainsWithoutPurpose(
  structure: ResolvedStructure,
): readonly string[] {
  return flatMap(values(structure), (environment) => {
    if (environment === undefined) {
      return [];
    }

    return collectStructureNodes(environment.root)
      .filter((node) => {
        return node.kind === "domain" && node.purpose === undefined;
      })
      .map((node) => node.path);
  });
}
