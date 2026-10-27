import { defineConvention } from "#eslint/conventions/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("unused-imports/no-unused-vars", [
      {
        ignoreRestSiblings: true,
      },
    ]),
  ],
  severity: "warn",
});
