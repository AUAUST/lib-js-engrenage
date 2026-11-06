import { checkSurfaces } from "#project/structure/index";
import { boundaryMessages } from "#tools/eslint/constants";
import { defineBoundaryRule } from "#tools/eslint/utils/defineBoundaryRule";
import { defineConvention } from "#tools/eslint/utils/defineConvention";

export default defineConvention({
  rule: (config) => {
    return defineBoundaryRule({
      config,
      description:
        "An element imports its own, ancestor and global roles, and other domains only through their public roles; a type-only role imports with `import type`.",
      check: checkSurfaces,
      messages: boundaryMessages,
    });
  },
});
