import { defineConvention } from "#eslint/utils/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("eqeqeq", ["smart"], {
      name: "no-loose-equal",
    }),
  ],
});
