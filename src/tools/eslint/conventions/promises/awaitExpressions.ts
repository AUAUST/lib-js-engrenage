import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { delegateRule } from "#tools/eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("unicorn/no-await-expression-member"),
    delegateRule("unicorn/prefer-top-level-await"),
  ],
  ignores: ["files.test"],
});
