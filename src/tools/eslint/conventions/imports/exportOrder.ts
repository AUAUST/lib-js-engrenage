import { defineConvention } from "#eslint/conventions/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("perfectionist/sort-exports", [
      {
        type: "natural",
        customGroups: [
          {
            groupName: "value-wildcard-export",
            selector: "export",
            modifiers: ["wildcard", "value"],
          },
          {
            groupName: "type-wildcard-export",
            selector: "export",
            modifiers: ["wildcard", "type"],
          },
        ],
        groups: [
          "value-export",
          "type-export",
          "value-wildcard-export",
          "type-wildcard-export",
        ],
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
