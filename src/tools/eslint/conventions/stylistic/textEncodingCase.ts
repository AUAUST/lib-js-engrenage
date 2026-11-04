import { defineConvention } from "#eslint/conventions/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("unicorn/text-encoding-identifier-case", [
      {
        withDash: true,
      },
    ]),
  ],
});
