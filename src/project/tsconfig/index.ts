// @barrel declarers/*.ts named
export { declareEnvironmentTsconfig } from "#project/tsconfig/declarers/declareEnvironmentTsconfig";
// @end

// @barrel utils/*.ts named
export { isLeftAlone } from "#project/tsconfig/utils/isLeftAlone";
export { isPackageAlias } from "#project/tsconfig/utils/isPackageAlias";
export { produceTsconfigBuildInfo } from "#project/tsconfig/utils/produceTsconfigBuildInfo";
export { produceTsconfigExtends } from "#project/tsconfig/utils/produceTsconfigExtends";
export { produceTsconfigPaths } from "#project/tsconfig/utils/produceTsconfigPaths";
export { readTsconfigPaths } from "#project/tsconfig/utils/readTsconfigPaths";
export { readTsconfigValue } from "#project/tsconfig/utils/readTsconfigValue";
export { relativeToTsconfig } from "#project/tsconfig/utils/relativeToTsconfig";
export { resolveTsconfig } from "#project/tsconfig/utils/resolveTsconfig";
export { resolveTsconfigOwner } from "#project/tsconfig/utils/resolveTsconfigOwner";
export { toJsonValue } from "#project/tsconfig/utils/toJsonValue";
export { toTsconfigGlobs } from "#project/tsconfig/utils/toTsconfigGlobs";
export { toTsconfigSpecifier } from "#project/tsconfig/utils/toTsconfigSpecifier";
// @end

// @barrel types/*.ts all
export * from "#project/tsconfig/types/EnvironmentTsconfig";
export * from "#project/tsconfig/types/ManagedEnvironmentTsconfig";
export * from "#project/tsconfig/types/PathAlias";
export * from "#project/tsconfig/types/PathAliases";
export * from "#project/tsconfig/types/Paths";
export * from "#project/tsconfig/types/ResolvedBaseTsconfig";
export * from "#project/tsconfig/types/ResolvedEnvironmentTsconfig";
export * from "#project/tsconfig/types/ResolvedEnvironmentTsconfigOption";
export * from "#project/tsconfig/types/ResolvedTypescript";
export * from "#project/tsconfig/types/Tsconfig";
export * from "#project/tsconfig/types/TsconfigEnvironment";
export * from "#project/tsconfig/types/TsconfigGroups";
export * from "#project/tsconfig/types/TsconfigKey";
export * from "#project/tsconfig/types/TsconfigOwner";
export * from "#project/tsconfig/types/TsconfigProducer";
export * from "#project/tsconfig/types/TsconfigTarget";
export * from "#project/tsconfig/types/TypescriptInput";
export * from "#project/tsconfig/types/UnmanagedEnvironmentTsconfig";
// @end

export {
  tsconfigEnvironments,
  unmanagedTsconfig,
} from "#project/tsconfig/constants";

// @barrel config/*.ts named

// @end

// @barrel config/schemas/*.ts named
export { typescriptSchema } from "#project/tsconfig/config/schemas/typescriptSchema";
// @end

// @barrel operations/*.ts named
export { createTsconfig } from "#project/tsconfig/operations/createTsconfig";
export { produceTsconfigExclude } from "#project/tsconfig/operations/produceTsconfigExclude";
export { produceTsconfigInclude } from "#project/tsconfig/operations/produceTsconfigInclude";
export { produceTsconfigLibrary } from "#project/tsconfig/operations/produceTsconfigLibrary";
export { produceTsconfigModule } from "#project/tsconfig/operations/produceTsconfigModule";
export { produceTsconfigOutDir } from "#project/tsconfig/operations/produceTsconfigOutDir";
export { produceTsconfigSkipLibraryCheck } from "#project/tsconfig/operations/produceTsconfigSkipLibraryCheck";
export { produceTsconfigSolution } from "#project/tsconfig/operations/produceTsconfigSolution";
export { produceTsconfigTarget } from "#project/tsconfig/operations/produceTsconfigTarget";
export { produceTsconfigTypes } from "#project/tsconfig/operations/produceTsconfigTypes";
export { resolvePathAliases } from "#project/tsconfig/operations/resolvePathAliases";
export { resolveTsconfigEnvironments } from "#project/tsconfig/operations/resolveTsconfigEnvironments";
export { resolveTsconfigLibrary } from "#project/tsconfig/operations/resolveTsconfigLibrary";
export { resolveTsconfigPresets } from "#project/tsconfig/operations/resolveTsconfigPresets";
export { resolveTsconfigRuntime } from "#project/tsconfig/operations/resolveTsconfigRuntime";
export { tsconfigProducers } from "#project/tsconfig/operations/tsconfigProducers";
// @end

// @barrel setup/*.ts named
export { syncTsconfigFiles } from "#project/tsconfig/setup/syncTsconfigFiles";
// @end
