import { checkSurfaces } from "#project/structure/index";
import { defineBoundaryConvention } from "#tools/eslint/utils/defineBoundaryConvention";

export default defineBoundaryConvention({
  check: checkSurfaces,
  description: "An element imports its own, ancestor and global roles, and other domains only through their public roles; a type-only role imports with `import type`.",
});
