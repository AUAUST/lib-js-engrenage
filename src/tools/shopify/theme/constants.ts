import type { Glob } from "#types/Glob";

// @debt re-exported only so the extension may import it under roles/extension/extension-imports
export { shopifyPrettierPluginLiquid } from "#constants";

export const themeLayoutGlob = "layout/theme.liquid" satisfies Glob;
