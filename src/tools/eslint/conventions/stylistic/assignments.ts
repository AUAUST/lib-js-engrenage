import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { delegateRule } from "#tools/eslint/utils/delegateRule";

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
