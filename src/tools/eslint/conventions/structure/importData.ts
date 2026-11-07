import {
  checkData,
  entitiesSection,
  importGrantsSection,
  importResolverSection,
  structureSection,
} from "#project/structure/index";
import { boundaryMessages } from "#tools/eslint/constants";
import { defineBoundaryRule } from "#tools/eslint/utils/defineBoundaryRule";
import { defineConvention } from "#tools/eslint/utils/defineConvention";

export default defineConvention({
  sections: {
    structure: structureSection,
    entities: entitiesSection,
    resolveImport: importResolverSection,
    grants: importGrantsSection,
  },
  rule: ({ grants, ...graph }, { root }) => {
    return defineBoundaryRule({
      root,
      graph,
      grants,
      description:
        "bin, tooling and a published package's src never import data directories.",
      check: checkData,
      messages: boundaryMessages,
    });
  },
});
