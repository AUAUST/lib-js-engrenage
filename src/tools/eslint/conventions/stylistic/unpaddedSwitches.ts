import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { delegateRule } from "#tools/eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule(
      "@stylistic/padded-blocks",
      [
        {
          switches: "never",
        },
      ],
      {
        name: "unpadded-switches",
      },
    ),
  ],
});
