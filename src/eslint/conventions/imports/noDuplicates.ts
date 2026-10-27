import { defineConvention } from "#eslint/conventions/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("import-x/no-duplicates", [
      {
        "prefer-inline": true,
      },
    ]),
  ],
});
