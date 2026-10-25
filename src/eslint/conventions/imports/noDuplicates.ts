import { defineConvention } from "#eslint/conventions/defineConvention";

export default defineConvention({
  rules: {
    "import-x/no-duplicates": [
      "error",
      {
        "prefer-inline": true,
      },
    ],
  },
});
