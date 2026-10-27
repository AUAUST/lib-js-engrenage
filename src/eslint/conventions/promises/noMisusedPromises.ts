import { defineConvention } from "#eslint/conventions/defineConvention";

export default defineConvention({
  rules: {
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        checksVoidReturn: {
          attributes: false,
        },
      },
    ],
  },
  files: ["public", "private"],
  typeAware: true,
});
