import { checkData } from "#batiment/structure/index";
import { defineBoundaryConvention } from "#tools/eslint/utils/defineBoundaryConvention";

export default defineBoundaryConvention({
  check: checkData,
  description: "bin, tooling and a published package's src never import data directories.",
});
