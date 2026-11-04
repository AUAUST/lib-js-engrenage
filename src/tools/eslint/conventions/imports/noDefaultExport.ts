import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { delegateRule } from "#tools/eslint/utils/delegateRule";

export default defineConvention({
  delegates: [delegateRule("import-x/no-default-export")],
  ignores: ["files.tooling", "files.discovered"],
});
