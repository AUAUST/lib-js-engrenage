import { defineConvention } from "#eslint/conventions/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("object-shorthand", ["always"]),
    delegateRule("prefer-object-spread"),
  ],
});
