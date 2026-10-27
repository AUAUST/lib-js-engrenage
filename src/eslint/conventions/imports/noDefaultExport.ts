import { defineConvention } from "#eslint/conventions/defineConvention";

export default defineConvention({
  rules: {
    "import-x/no-default-export": "error",
  },
  ignores: ["config", "discovered"],
});
