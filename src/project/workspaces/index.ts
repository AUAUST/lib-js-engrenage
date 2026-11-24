// @barrel types
export type * from "#project/workspaces/types/ResolvedWorkspace";
export type * from "#project/workspaces/types/ResolvedWorkspaceGroup";
// @end

// @barrel config/schemas
export { nameSchema } from "#project/workspaces/config/schemas/nameSchema";
export { workspaceSchema } from "#project/workspaces/config/schemas/workspaceSchema";
export { workspacesSchema } from "#project/workspaces/config/schemas/workspacesSchema";
// @end

// @barrel operations
export { listScopeConfigs } from "#project/workspaces/operations/listScopeConfigs";
export { resolveWorkspaces } from "#project/workspaces/operations/resolveWorkspaces";
// @end

// @barrel config/sections
export { discoverySection } from "#project/workspaces/config/sections/discoverySection";
export { nameSection } from "#project/workspaces/config/sections/nameSection";
export { scopesSection } from "#project/workspaces/config/sections/scopesSection";
export { workspacesOptionsSection } from "#project/workspaces/config/sections/workspacesOptionsSection";
export { workspacesSection } from "#project/workspaces/config/sections/workspacesSection";
// @end
