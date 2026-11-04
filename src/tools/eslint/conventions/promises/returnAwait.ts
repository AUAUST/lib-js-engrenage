import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { delegateRule } from "#tools/eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("@typescript-eslint/return-await", [
      "error-handling-correctness-only",
    ]),
  ],
  files: ["files.code.published", "files.code.private"],
  typeAware: true,
});
