export { define } from "#project/config/index";
// @barrel config/define*Config.ts named
export { defineConfig } from "#workflows/config/config/defineConfig";
// @end
export type { Resolvable } from "#types/Resolvable";

// @barrel operations/*.ts named
export { listConfigSections } from "#workflows/config/operations/listConfigSections";
export { validateConfig } from "#workflows/config/operations/validateConfig";
// @end

// @barrel types/*.ts all
export * from "#workflows/config/types/ConfigInput";
// @end
