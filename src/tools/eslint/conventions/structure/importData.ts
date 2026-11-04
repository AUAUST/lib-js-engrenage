import { createBoundaryRule } from "#tools/eslint/utils/createBoundaryRule";
import { defineConvention } from "#tools/eslint/utils/defineConvention";

export default defineConvention({
  rule: (config) => createBoundaryRule(config, "data"),
});
