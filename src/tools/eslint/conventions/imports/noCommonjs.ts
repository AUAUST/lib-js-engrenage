import { defineConvention } from "#eslint/utils/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("import-x/no-commonjs", [
      {
        allowRequire: true,
      },
    ]),
  ],
});
