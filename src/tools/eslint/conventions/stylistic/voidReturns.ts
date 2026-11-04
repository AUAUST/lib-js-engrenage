import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { delegateRule } from "#tools/eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("@typescript-eslint/no-confusing-void-expression", [
      {
        ignoreVoidOperator: true,
      },
    ]),
  ],
  files: ["files.code.published", "files.code.private"],
  ignores: ["files.test"],
  typeAware: true,
});
