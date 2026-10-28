import { defineConvention } from "#eslint/conventions/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("logical-assignment-operators", [
      "always",
      {
        enforceForIfStatements: true,
      },
    ]),
    delegateRule("operator-assignment", ["always"]),
  ],
});
