import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { delegateRule } from "#tools/eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("@typescript-eslint/prefer-optional-chain"),
    delegateRule("@typescript-eslint/prefer-readonly"),
  ],
  files: ["files.code.published", "files.code.private"],
  typeAware: true,
});
