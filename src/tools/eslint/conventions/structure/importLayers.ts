import { checkLayers } from "#project/structure/index";
import { defineBoundaryConvention } from "#tools/eslint/utils/defineBoundaryConvention";

export default defineBoundaryConvention({
  check: checkLayers,
  description: "An element imports only the index.ts of a domain in a lower layer, of a non-isolated peer or of its own sub-domain.",
});
