import { defineConvention } from "#eslint/conventions/defineConvention";

export default defineConvention({
  rules: {
    "import-x/no-default-export": "error",
  },
  ignores: ["files.config", "files.discovered"],
});
