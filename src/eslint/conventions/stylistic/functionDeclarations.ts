import { defineConvention } from "#eslint/conventions/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule(
      "func-style",
      [
        "declaration",
        {
          allowTypeAnnotation: true,
          allowArrowFunctions: true,
        },
      ],
      {
        name: "prefer-function-declaration",
      },
    ),
  ],
});
