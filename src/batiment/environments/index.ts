// @barrel config/declarers
export { declareLanguages } from "#batiment/environments/config/declarers/declareLanguages";
// @end

// @barrel ports
export type * from "#batiment/environments/ports/EnvironmentExecution";
export type * from "#batiment/environments/ports/EnvironmentPreset";
// @end

// @barrel types
export type * from "#batiment/environments/types/DiscoveredEnvironment";
export type * from "#batiment/environments/types/EnvironmentCoverage";
export type * from "#batiment/environments/types/EnvironmentInstance";
export type * from "#batiment/environments/types/EnvironmentPlacement";
export type * from "#batiment/environments/types/EnvironmentPlacements";
export type * from "#batiment/environments/types/EnvironmentRegistration";
export type * from "#batiment/environments/types/LanguageChoice";
export type * from "#batiment/environments/types/LanguageSelection";
export type * from "#batiment/environments/types/RegisteredEnvironment";
// @end

// @barrel utils
export { createEnvironmentPreset } from "#batiment/environments/utils/createEnvironmentPreset";
export { getDirectoryEnvironment } from "#batiment/environments/utils/getDirectoryEnvironment";
export { getEnvironmentCoverage } from "#batiment/environments/utils/getEnvironmentCoverage";
export { getFileEnvironment } from "#batiment/environments/utils/getFileEnvironment";
export { listEnvironmentInstances } from "#batiment/environments/utils/listEnvironmentInstances";
export { listForeignPlacementGlobs } from "#batiment/environments/utils/listForeignPlacementGlobs";
export { resolveRegisteredEnvironments } from "#batiment/environments/utils/resolveRegisteredEnvironments";
// @end

// @barrel config/schemas
export { environmentMetadataSchema } from "#batiment/environments/config/schemas/environmentMetadataSchema";
// @end

// @barrel operations
export { discoverEnvironmentPlacements } from "#batiment/environments/operations/discoverEnvironmentPlacements";
// @end
