import { checkWorkspaces } from "#batiment/structure/index";
import { defineBoundaryConvention } from "#tools/eslint/utils/defineBoundaryConvention";

export default defineBoundaryConvention({
  check: checkWorkspaces,
  description: "A workspace imports another scope only by package name, through a declared dependency, onto a subpath it exports; the root src never imports a workspace.",
});
