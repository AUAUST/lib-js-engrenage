import { defineConvention } from "#eslint/conventions/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("no-else-return", [
      {
        allowElseIf: false,
      },
    ]),
    delegateRule("no-unneeded-ternary"),
    delegateRule("unicorn/no-nested-ternary"),
  ],
});
