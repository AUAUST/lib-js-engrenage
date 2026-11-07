import { defineEslintConfig } from "#tools/eslint/index";

export default defineEslintConfig({
  stylistic: {
    functionLines: false, // @debt refactor required to cleanup
    cognitiveComplexity: false, // @debt refactor required to cleanup
  },
});
