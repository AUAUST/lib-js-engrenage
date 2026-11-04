import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { delegateRule } from "#tools/eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("unused-imports/no-unused-vars", [
      {
        args: "after-used",
        argsIgnorePattern: "^(?:_|(?:ignored|unused)(?:[A-Z\\d_]|$))",
        ignoreRestSiblings: true,
      },
    ]),
  ],
  severity: "info",
});
