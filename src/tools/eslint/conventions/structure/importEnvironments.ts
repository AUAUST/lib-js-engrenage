import { checkEnvironments } from "#project/structure/index";
import { boundaryMessages } from "#tools/eslint/constants";
import { defineBoundaryRule } from "#tools/eslint/utils/defineBoundaryRule";
import { defineConvention } from "#tools/eslint/utils/defineConvention";

export default defineConvention({
  rule: (config) => {
    return defineBoundaryRule({
      config,
      description:
        "A module imports only the environments and categories its environment reaches, and never the root file of an environment.",
      check: checkEnvironments,
      messages: boundaryMessages,
    });
  },
});
