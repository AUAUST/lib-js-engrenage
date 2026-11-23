// @barrel ports
export type * from "#batiment/scopes/ports/EnvironmentClaim";
// @end

// @barrel types
export type * from "#batiment/scopes/types/DiscoveredEnvironment";
export type * from "#batiment/scopes/types/DiscoveredWorkspace";
export type * from "#batiment/scopes/types/Scope";
export type * from "#batiment/scopes/types/ScopedEnvironment";
export type * from "#batiment/scopes/types/ScopeTree";
// @end

// @barrel config/schemas
export { workspaceMetadataSchema } from "#batiment/scopes/config/schemas/workspaceMetadataSchema";
// @end

// @barrel utils
export { createScopeTree } from "#batiment/scopes/utils/createScopeTree";
export { getEnvironmentId } from "#batiment/scopes/utils/getEnvironmentId";
export { reconcileEnvironmentDirs } from "#batiment/scopes/utils/reconcileEnvironmentDirs";
// @end
