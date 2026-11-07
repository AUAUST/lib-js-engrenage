import { formatSection } from "#project/format/index";
import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { delegateRule } from "#tools/eslint/utils/delegateRule";

export default defineConvention({
  sections: { format: formatSection },
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
