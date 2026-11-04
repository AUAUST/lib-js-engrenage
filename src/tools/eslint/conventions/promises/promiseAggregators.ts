import { defineConvention } from "#eslint/conventions/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("unicorn/no-await-in-promise-methods"),
    delegateRule("unicorn/no-single-promise-in-promise-methods"),
    delegateRule("unicorn/no-unsafe-promise-all-settled-values"),
  ],
});
