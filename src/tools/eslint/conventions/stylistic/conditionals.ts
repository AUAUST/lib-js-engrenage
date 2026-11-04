import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { delegateRule } from "#tools/eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("no-else-return", [
      {
        allowElseIf: false,
      },
    ]),
    delegateRule("no-unneeded-ternary"),
  ],
});
