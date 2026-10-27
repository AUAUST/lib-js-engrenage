import { defineConvention } from "#eslint/conventions/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("perfectionist/sort-exports", [
      {
        type: "natural",
        groups: ["value-export", "type-export"],
        newlinesBetween: "ignore",
        partitionByComment: true,
      },
    ]),
    delegateRule("perfectionist/sort-named-exports", [
      {
        type: "natural",
        groups: ["value-export", "type-export"],
      },
    ]),
  ],
});
