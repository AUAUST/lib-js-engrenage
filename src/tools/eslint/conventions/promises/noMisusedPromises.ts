import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { delegateRule } from "#tools/eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("@typescript-eslint/no-misused-promises", [
      {
        checksVoidReturn: false,
      },
    ]),
  ],
  files: ["files.code.published", "files.code.private"],
  typeAware: true,
});
