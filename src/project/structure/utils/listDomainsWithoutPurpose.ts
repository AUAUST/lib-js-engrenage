import { flatMap } from "@auaust/primitive-kit/arrays";
import { values } from "@auaust/toolkit/object";

import type { ResolvedStructure } from "#project/structure/types/ResolvedStructure";
import { collectStructureNodes } from "#project/structure/utils/collectStructureNodes";

export function listDomainsWithoutPurpose(
  structure: ResolvedStructure,
): readonly string[] {
  return flatMap(values(structure), (environment) => {
    if (environment === undefined) {
      return [];
    }

    return collectStructureNodes(environment.root)
      .filter((node) => node.kind === "domain" && node.purpose === undefined)
      .map((node) => node.path);
  });
}
