import { checkWorkspaces } from "#project/structure/index";
import { boundaryMessages } from "#tools/eslint/constants";
import { defineBoundaryRule } from "#tools/eslint/utils/defineBoundaryRule";
import { defineConvention } from "#tools/eslint/utils/defineConvention";

export default defineConvention({
  rule: (config) => {
    return defineBoundaryRule({
      config,
      description:
        "A workspace imports another only when it declares it as a dependency, and the root src never imports a workspace.",
      check: checkWorkspaces,
      messages: boundaryMessages,
    });
  },
});
