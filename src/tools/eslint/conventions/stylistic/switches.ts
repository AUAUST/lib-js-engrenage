import { defineConvention } from "#eslint/conventions/defineConvention";
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
