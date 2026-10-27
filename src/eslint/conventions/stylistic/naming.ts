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
