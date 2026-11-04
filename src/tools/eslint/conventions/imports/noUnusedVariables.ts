import { defineConvention } from "#eslint/conventions/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";

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
