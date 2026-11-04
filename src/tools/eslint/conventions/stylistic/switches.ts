import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { delegateRule } from "#tools/eslint/utils/delegateRule";

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
