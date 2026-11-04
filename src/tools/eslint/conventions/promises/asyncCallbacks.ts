import { defineConvention } from "#eslint/conventions/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("unicorn/no-async-iterator-callback"),
    delegateRule("unicorn/no-async-promise-finally"),
  ],
});
