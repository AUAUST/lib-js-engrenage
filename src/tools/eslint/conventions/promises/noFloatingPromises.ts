import { defineConvention } from "#eslint/conventions/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";

export default defineConvention({
  delegates: [delegateRule("@typescript-eslint/no-floating-promises")],
  files: ["files.code.published", "files.code.private"],
  typeAware: true,
});
