import { defineConvention } from "#eslint/conventions/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";

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
    delegateRule("@stylistic/quote-props", ["consistent-as-needed"]),
  ],
});
