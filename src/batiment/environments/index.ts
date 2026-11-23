// @barrel config/declarers
export { declareLanguages } from "#batiment/environments/config/declarers/declareLanguages";
// @end

// @barrel ports
export type * from "#batiment/environments/ports/EnvironmentPreset";
// @end

// @barrel types
export type * from "#batiment/environments/types/DiscoveredEnvironment";
export type * from "#batiment/environments/types/EnvironmentPlacement";
export type * from "#batiment/environments/types/EnvironmentRegistration";
export type * from "#batiment/environments/types/RegisteredEnvironment";
// @end

// @barrel utils
export { createEnvironmentPreset } from "#batiment/environments/utils/createEnvironmentPreset";
export { resolveRegisteredEnvironments } from "#batiment/environments/utils/resolveRegisteredEnvironments";
// @end

// @barrel config/schemas
export { environmentMetadataSchema } from "#batiment/environments/config/schemas/environmentMetadataSchema";
// @end
