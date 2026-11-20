import { checkWorkspaces } from "#batiment/structure/index";
import { defineBoundaryConvention } from "#tools/eslint/utils/defineBoundaryConvention";

export default defineBoundaryConvention({
  check: checkWorkspaces,
  description: "A workspace imports another only when it declares it as a dependency, and the root src never imports a workspace.",
});
