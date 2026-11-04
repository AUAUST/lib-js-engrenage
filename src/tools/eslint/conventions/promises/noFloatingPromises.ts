import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { delegateRule } from "#tools/eslint/utils/delegateRule";

export default defineConvention({
  delegates: [delegateRule("@typescript-eslint/no-floating-promises")],
  files: ["files.code.published", "files.code.private"],
  typeAware: true,
});
