import { defineConvention } from "#eslint/utils/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("unicorn/switch-case-braces", ["always"]),
    delegateRule("no-fallthrough", [
      {
        reportUnusedFallthroughComment: true,
      },
    ]),
  ],
});
