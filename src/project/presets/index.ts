export { resolveTraits } from "#project/presets/utils/resolveTraits";

// @barrel types/*.ts all
export * from "#project/presets/types/Preset";
export * from "#project/presets/types/ResolvedTraitAdjustments";
export * from "#project/presets/types/ResolvedTraits";
export * from "#project/presets/types/Trait";
export * from "#project/presets/types/TraitsInput";
// @end

// @barrel config/schemas/*.ts named
export { presetSchema } from "#project/presets/config/schemas/presetSchema";
export { traitsSchema } from "#project/presets/config/schemas/traitsSchema";
// @end

// @barrel config/sections/*.ts named
export { presetSection } from "#project/presets/config/sections/presetSection";
export { traitAdjustmentsSection } from "#project/presets/config/sections/traitAdjustmentsSection";
export { traitsSection } from "#project/presets/config/sections/traitsSection";
// @end
