import { defineConvention } from "#eslint/conventions/defineConvention";

export default defineConvention({
  rules: {
    "prefer-const": [
      "error",
      {
        destructuring: "all",
      },
    ],
  },
});
