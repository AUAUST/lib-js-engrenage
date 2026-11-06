// @barrel config/declare*.ts named
export { declareEnvironmentTsconfig } from "#project/tsconfig/config/declareEnvironmentTsconfig";
// @end

// @barrel utils/*.ts named
export { isLeftAlone } from "#project/tsconfig/utils/isLeftAlone";
export { isPackageAlias } from "#project/tsconfig/utils/isPackageAlias";
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

// @barrel config/*Schema.ts named
export { typescriptSchema } from "#project/tsconfig/config/typescriptSchema";
// @end

// @barrel operations/*.ts named
export { createTsconfig } from "#project/tsconfig/operations/createTsconfig";
export { resolvePathAliases } from "#project/tsconfig/operations/resolvePathAliases";
export { resolveTsconfigPresets } from "#project/tsconfig/operations/resolveTsconfigPresets";
// @end
