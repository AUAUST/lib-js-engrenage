import { checkTests } from "#project/structure/index";
import { boundaryMessages } from "#tools/eslint/constants";
import { defineBoundaryRule } from "#tools/eslint/utils/defineBoundaryRule";
import { defineConvention } from "#tools/eslint/utils/defineConvention";

export default defineConvention({
  rule: (config) => {
    return defineBoundaryRule({
      config,
      description:
        "In a published package, a test that runs against source and dist imports the package name, a source-only test imports internals, and a dist-only test imports the package name and the build output.",
      check: checkTests,
      messages: boundaryMessages,
    });
  },
});
