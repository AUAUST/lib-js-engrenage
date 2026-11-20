import { map } from "@auaust/toolkit/iterable";

import { renderCardinalityViolation } from "#project/structure/utils/renderCardinalityViolation";
import { renderCommandGroupTwin } from "#project/structure/utils/renderCommandGroupTwin";
import type { StructureNode } from "#project/structure/types/StructureNode";

export function listNodeViolations(node: StructureNode): string[] {
  return [
    ...(map(node.cardinality, renderCardinalityViolation) ?? []),
    ...(node.twin === undefined
      ? []
      : [renderCommandGroupTwin({ path: node.path, twin: node.twin })]),
  ];
}
