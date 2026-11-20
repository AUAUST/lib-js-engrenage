import { checkEnvironments } from "#project/structure/index";
import { defineBoundaryConvention } from "#tools/eslint/utils/defineBoundaryConvention";

export default defineBoundaryConvention({
  check: checkEnvironments,
  description: "A module imports only the environments and categories its environment reaches, and never the root file of an environment.",
});
