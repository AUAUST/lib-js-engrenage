import { defineConvention } from "#eslint/utils/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";

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
