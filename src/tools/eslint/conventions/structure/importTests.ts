import {
  checkTests,
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
        "In a published package, a test that runs against source and dist imports the package name, a source-only test imports internals, and a dist-only test imports the package name and the build output.",
      check: checkTests,
      messages: boundaryMessages,
    });
  },
});
