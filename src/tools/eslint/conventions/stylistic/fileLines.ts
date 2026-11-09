import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { delegateRule } from "#tools/eslint/utils/delegateRule";

export default defineConvention({
  sections: { format: "format" },
  ignores: ["files.test", "files.generated"],
  delegates({ format }) {
    return [
      delegateRule("max-lines", [
        {
          max: format.maxFileLines,
          skipBlankLines: true,
          skipComments: true,
        },
      ]),
    ];
  },
});
