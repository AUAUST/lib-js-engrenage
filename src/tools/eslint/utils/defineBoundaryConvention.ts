import { boundaryMessages } from "#tools/eslint/constants";
import { defineBoundaryRule } from "#tools/eslint/utils/defineBoundaryRule";
import { defineConvention } from "#tools/eslint/utils/defineConvention";
import type {
  BoundaryViolation,
  ImportEdge,
  ImportGrants,
} from "#project/structure/index";
import type { Convention } from "#tools/eslint/ports/Convention";

export function defineBoundaryConvention({
  check,
  description,
}: {
  check(edge: ImportEdge, grants: ImportGrants): BoundaryViolation | undefined;
  description: string;
}): Convention {
  return defineConvention({
    sections: {
      structure: "structure",
      entities: "entities",
      resolveImport: "importResolver",
      grants: "importGrants",
    },
    rule: ({ grants, ...graph }, { root }) => {
      return defineBoundaryRule({
        root,
        graph,
        grants,
        description,
        check,
        messages: boundaryMessages,
      });
    },
  });
}
