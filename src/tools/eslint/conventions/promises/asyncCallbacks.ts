import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { delegateRule } from "#tools/eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("unicorn/no-async-iterator-callback"),
    delegateRule("unicorn/no-async-promise-finally"),
  ],
});
