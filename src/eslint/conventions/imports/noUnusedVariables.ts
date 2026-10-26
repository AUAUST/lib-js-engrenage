import { defineConvention } from "#eslint/conventions/defineConvention";

export default defineConvention({
  rules: {
    "unused-imports/no-unused-vars": [
      "warn",
      {
        ignoreRestSiblings: true,
      },
    ],
  },
});
