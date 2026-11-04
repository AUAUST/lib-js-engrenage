import { defineConvention } from "#eslint/conventions/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("no-promise-executor-return"),
    delegateRule("unicorn/no-multiple-promise-resolver-calls"),
    delegateRule("unicorn/no-useless-promise-resolve-reject"),
    delegateRule("unicorn/prefer-promise-static-methods"),
  ],
});
