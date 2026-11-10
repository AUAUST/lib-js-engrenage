import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { delegateRule } from "#tools/eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule(
      "object-shorthand",
      [
        "always",
        {
          avoidQuotes: true,
        },
      ],
      {
        ignoredMessages: ["expectedLiteralMethodLongform"],
      },
    ),
    delegateRule("prefer-object-spread"),
  ],
});
