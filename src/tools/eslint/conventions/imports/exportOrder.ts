import { exportGroups } from "#project/format/index";
import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { delegateRule } from "#tools/eslint/utils/delegateRule";
import type { RuleOptions } from "#tools/eslint/types/RuleOptions";

type CustomGroup = NonNullable<
  NonNullable<RuleOptions<"perfectionist/sort-exports">[0]>["customGroups"]
>[number];

export default defineConvention({
  delegates: [
    delegateRule("perfectionist/sort-exports", [
      {
        type: "natural",
        customGroups: exportGroups
          .filter(({ wildcard }) => wildcard)
          .map(({ name, typeOnly }): CustomGroup => {
            return {
              groupName: name,
              selector: "export",
              modifiers: ["wildcard", typeOnly ? "type" : "value"],
            };
          }),
        groups: exportGroups.map(({ name }) => name),
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
