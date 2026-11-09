import { defineEslintConfig } from "#tools/eslint/index";

export default defineEslintConfig({
  stylistic: {
    functionLines: false, // @debt refactor required to cleanup
    cognitiveComplexity: false, // @debt refactor required to cleanup
  },
  imports: {
    noPointlessDynamicImport: false, // @debt existing import() sites in src and scripts break the rule until #221 settles them
  },
});
