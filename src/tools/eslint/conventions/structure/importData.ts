import { checkData } from "#project/structure/index";
import { boundaryMessages } from "#tools/eslint/constants";
import { defineBoundaryRule } from "#tools/eslint/utils/defineBoundaryRule";
import { defineConvention } from "#tools/eslint/utils/defineConvention";

export default defineConvention({
  rule: (config) => {
    return defineBoundaryRule({
      config,
      description:
        "bin, tooling and a published package's src never import data directories.",
      check: checkData,
      messages: boundaryMessages,
    });
  },
});
