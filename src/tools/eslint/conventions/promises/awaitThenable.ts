import { defineConvention } from "#eslint/conventions/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("@typescript-eslint/await-thenable", [
      {
        allowMixedPromiseArrays: true,
      },
    ]),
  ],
  files: ["files.code.published", "files.code.private"],
  typeAware: true,
});
