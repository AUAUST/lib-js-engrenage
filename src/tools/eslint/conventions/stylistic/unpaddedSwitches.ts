import { defineConvention } from "#eslint/conventions/defineConvention";
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
