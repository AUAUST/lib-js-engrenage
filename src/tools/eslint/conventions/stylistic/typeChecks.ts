import { defineConvention } from "#eslint/conventions/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("@typescript-eslint/prefer-optional-chain"),
    delegateRule("@typescript-eslint/prefer-readonly"),
  ],
  files: ["files.code.published", "files.code.private"],
  typeAware: true,
});
