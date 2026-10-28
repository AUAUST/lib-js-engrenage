import { defineConvention } from "#eslint/conventions/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("@typescript-eslint/naming-convention", [
      {
        selector: ["variable", "function"],
        format: ["camelCase", "PascalCase"],
        leadingUnderscore: "allow",
      },
      {
        selector: "variable",
        filter: {
          regex: "^__.+__$",
          match: true,
        },
        format: ["UPPER_CASE"],
        leadingUnderscore: "requireDouble",
        trailingUnderscore: "requireDouble",
      },
      {
        selector: "variable",
        modifiers: ["destructured"],
        format: null,
      },
      {
        selector: "typeLike",
        format: ["PascalCase"],
      },
    ]),
  ],
  severity: "info",
});
