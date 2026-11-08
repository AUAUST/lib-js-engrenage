import { defineEslintConfig } from "#tools/eslint/index";

export default defineEslintConfig({
  stylistic: {
    functionLines: false, // @debt refactor required to cleanup
    cognitiveComplexity: false, // @debt refactor required to cleanup
  },
  imports: {
    noDynamicImport: false, // @debt the rule forbids beneficial dynamic imports, such as lazy command loading, until #221 replaces it
  },
});
