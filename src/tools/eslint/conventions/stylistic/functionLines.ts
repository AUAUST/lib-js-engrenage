import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { delegateRule } from "#tools/eslint/utils/delegateRule";

export default defineConvention({
  sections: { format: "format" },
  ignores: ["files.test"],
  delegates({ format }) {
    return [
      delegateRule("max-lines-per-function", [
        {
          max: format.maxFunctionLines,
          skipBlankLines: true,
          skipComments: true,
        },
      ]),
    ];
  },
});
