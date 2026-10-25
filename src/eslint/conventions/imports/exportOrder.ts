import { defineConvention } from "#eslint/conventions/defineConvention";

export default defineConvention({
  rules: {
    "perfectionist/sort-exports": [
      "error",
      {
        type: "natural",
        groups: ["value-export", "type-export"],
        newlinesBetween: "ignore",
        partitionByComment: true,
      },
    ],
    "perfectionist/sort-named-exports": [
      "error",
      {
        type: "natural",
        groups: ["value-export", "type-export"],
      },
    ],
  },
});
