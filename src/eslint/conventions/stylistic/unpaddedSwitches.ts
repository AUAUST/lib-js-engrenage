import { defineConvention } from "#eslint/conventions/defineConvention";

export default defineConvention({
  rules: {
    "@stylistic/padded-blocks": [
      "error",
      {
        switches: "never",
      },
    ],
  },
});
