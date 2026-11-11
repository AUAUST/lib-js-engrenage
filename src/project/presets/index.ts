export { resolveTraits } from "#project/presets/utils/resolveTraits";

// @barrel types
export type * from "#project/presets/types/ResolvedTraitAdjustments";
export type * from "#project/presets/types/ResolvedTraits";
export type * from "#project/presets/types/Trait";
export type * from "#project/presets/types/TraitsInput";
// @end

// @barrel ports
export type * from "#project/presets/ports/PresetEntry";
// @end

// @barrel config/schemas
export { presetNameSchema } from "#project/presets/config/schemas/presetNameSchema";
export { presetSchema } from "#project/presets/config/schemas/presetSchema";
export { traitsSchema } from "#project/presets/config/schemas/traitsSchema";
// @end

// @barrel config/sections
export { presetSection } from "#project/presets/config/sections/presetSection";
export { traitAdjustmentsSection } from "#project/presets/config/sections/traitAdjustmentsSection";
export { traitsSection } from "#project/presets/config/sections/traitsSection";
// @end
