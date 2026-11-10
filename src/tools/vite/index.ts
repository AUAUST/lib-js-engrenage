// @barrel setup/*.ts named
export { createViteConfigStep } from "#tools/vite/setup/createViteConfigStep";
// @end

// @barrel config/define*Config.ts named
export { defineViteConfig } from "#tools/vite/config/defineViteConfig";
// @end

// @barrel operations/*.ts named
export { createViteConfig } from "#tools/vite/operations/createViteConfig";
// @end

// @barrel types/*.ts types
export type * from "#tools/vite/types/Config";
export type * from "#tools/vite/types/ConfigEnv";
export type * from "#tools/vite/types/ConfigFn";
export type * from "#tools/vite/types/ConfigLayer";
export type * from "#tools/vite/types/Options";
export type * from "#tools/vite/types/Plugin";
// @end
