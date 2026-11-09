import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { delegateRule } from "#tools/eslint/utils/delegateRule";

export default defineConvention({
  sections: { format: "format" },
  delegates({ format }) {
    return [
      delegateRule("sonarjs/cognitive-complexity", [
        format.maxCognitiveComplexity,
      ]),
    ];
  },
});
