import { defineConvention } from "#eslint/conventions/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("unicorn/no-await-expression-member"),
    delegateRule("unicorn/prefer-top-level-await"),
  ],
});
