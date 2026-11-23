import { checkNamespaces } from "#batiment/structure/index";
import { defineBoundaryConvention } from "#tools/eslint/utils/defineBoundaryConvention";

// @debt the rule and its description still name top-level namespaces environments, a user-configured name #872 left for a changeset of its own
export default defineBoundaryConvention({
  check: checkNamespaces,
  description: "A module imports only the environments and categories its environment reaches, and never the root file of an environment.",
});
