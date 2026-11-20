import { map } from "@auaust/toolkit/iterable";

import { renderCardinalityViolation } from "#batiment/structure/utils/renderCardinalityViolation";
import { renderCommandGroupTwin } from "#batiment/structure/utils/renderCommandGroupTwin";
import type { StructureNode } from "#batiment/structure/types/StructureNode";

export function listNodeViolations(node: StructureNode): string[] {
  return [
    ...(map(node.cardinality, renderCardinalityViolation) ?? []),
    ...(node.twin === undefined
      ? []
      : [renderCommandGroupTwin({ path: node.path, twin: node.twin })]),
  ];
}
