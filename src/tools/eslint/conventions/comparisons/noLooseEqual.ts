import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { delegateRule } from "#tools/eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("eqeqeq", ["smart"], {
      name: "no-loose-equal",
    }),
  ],
});
