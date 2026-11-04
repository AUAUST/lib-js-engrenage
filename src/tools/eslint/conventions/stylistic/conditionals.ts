import { defineConvention } from "#eslint/utils/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";

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
