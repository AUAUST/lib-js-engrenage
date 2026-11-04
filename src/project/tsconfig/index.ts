// @barrel utils/*.ts named
export { isPackageAlias } from "#tsconfig/utils/isPackageAlias";
export { relativeToTsconfig } from "#tsconfig/utils/relativeToTsconfig";
export { resolveTsconfig } from "#tsconfig/utils/resolveTsconfig";
export { resolveTsconfigOwner } from "#tsconfig/utils/resolveTsconfigOwner";
export { toTsconfigGlobs } from "#tsconfig/utils/toTsconfigGlobs";
export { toTsconfigSpecifier } from "#tsconfig/utils/toTsconfigSpecifier";
// @end

// @barrel types/*.ts all
export * from "#tsconfig/types/EnvironmentTsconfig";
export * from "#tsconfig/types/ManagedEnvironmentTsconfig";
export * from "#tsconfig/types/PathAlias";
export * from "#tsconfig/types/PathAliases";
export * from "#tsconfig/types/Paths";
export * from "#tsconfig/types/ResolvedBaseTsconfig";
export * from "#tsconfig/types/ResolvedEnvironmentTsconfig";
export * from "#tsconfig/types/ResolvedEnvironmentTsconfigOption";
export * from "#tsconfig/types/Tsconfig";
export * from "#tsconfig/types/TsconfigEnvironment";
export * from "#tsconfig/types/TsconfigGroups";
export * from "#tsconfig/types/TsconfigKey";
export * from "#tsconfig/types/TsconfigOwner";
export * from "#tsconfig/types/TsconfigProducer";
export * from "#tsconfig/types/TsconfigTarget";
export * from "#tsconfig/types/UnmanagedEnvironmentTsconfig";
// @end
