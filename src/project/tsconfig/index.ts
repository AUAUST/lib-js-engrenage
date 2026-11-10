// @barrel config/declarers/*.ts named
export { declareEnvironmentTsconfig } from "#project/tsconfig/config/declarers/declareEnvironmentTsconfig";
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

// @barrel types/*.ts types
export type * from "#project/tsconfig/types/EnvironmentTsconfig";
export type * from "#project/tsconfig/types/ManagedEnvironmentTsconfig";
export type * from "#project/tsconfig/types/PathAlias";
export type * from "#project/tsconfig/types/PathAliases";
export type * from "#project/tsconfig/types/Paths";
export type * from "#project/tsconfig/types/ResolvedBaseTsconfig";
export type * from "#project/tsconfig/types/ResolvedEnvironmentTsconfig";
export type * from "#project/tsconfig/types/ResolvedEnvironmentTsconfigOption";
export type * from "#project/tsconfig/types/ResolvedTypescript";
export type * from "#project/tsconfig/types/Tsconfig";
export type * from "#project/tsconfig/types/TsconfigGroups";
export type * from "#project/tsconfig/types/TsconfigKey";
export type * from "#project/tsconfig/types/TsconfigOwner";
export type * from "#project/tsconfig/types/TsconfigProducer";
export type * from "#project/tsconfig/types/TsconfigTarget";
export type * from "#project/tsconfig/types/TypescriptInput";
export type * from "#project/tsconfig/types/UnmanagedEnvironmentTsconfig";
// @end

export { unmanagedTsconfig } from "#project/tsconfig/constants";

// @barrel config/schemas/*.ts named
export { inheritsSchema } from "#project/tsconfig/config/schemas/inheritsSchema";
export { typescriptSchema } from "#project/tsconfig/config/schemas/typescriptSchema";
// @end

// @barrel config/sections/*.ts named
export { tsconfigPathSection } from "#project/tsconfig/config/sections/tsconfigPathSection";
export { tsconfigSection } from "#project/tsconfig/config/sections/tsconfigSection";
export { typescriptOptionsSection } from "#project/tsconfig/config/sections/typescriptOptionsSection";
export { typescriptSection } from "#project/tsconfig/config/sections/typescriptSection";
// @end

// @barrel operations/*.ts named
export { createTsconfig } from "#project/tsconfig/operations/createTsconfig";
export { locateTsconfigPath } from "#project/tsconfig/operations/locateTsconfigPath";
export { resolvePathAliases } from "#project/tsconfig/operations/resolvePathAliases";
export { resolveTsconfigPresets } from "#project/tsconfig/operations/resolveTsconfigPresets";
// @end
