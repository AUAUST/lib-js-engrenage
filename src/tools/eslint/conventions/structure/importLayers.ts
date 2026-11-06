import { checkLayers } from "#project/structure/index";
import { boundaryMessages } from "#tools/eslint/constants";
import { defineBoundaryRule } from "#tools/eslint/utils/defineBoundaryRule";
import { defineConvention } from "#tools/eslint/utils/defineConvention";

export default defineConvention({
  rule: (config) => {
    return defineBoundaryRule({
      config,
      description:
        "An element imports only the index.ts of a domain in a lower layer, of a non-isolated peer or of its own sub-domain.",
      check: checkLayers,
      messages: boundaryMessages,
    });
  },
});
