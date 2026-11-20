import { checkTests } from "#project/structure/index";
import { defineBoundaryConvention } from "#tools/eslint/utils/defineBoundaryConvention";

export default defineBoundaryConvention({
  check: checkTests,
  description: "In a published package, a test that runs against source and dist imports the package name, a source-only test imports internals, and a dist-only test imports the package name and the build output.",
});
