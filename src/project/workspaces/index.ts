// @barrel types
export type * from "#project/workspaces/types/ResolvedWorkspace";
export type * from "#project/workspaces/types/ResolvedWorkspaceGroup";
export type * from "#project/workspaces/types/WorkspaceTsconfig";
// @end

// @barrel config/schemas
export { workspaceSchema } from "#project/workspaces/config/schemas/workspaceSchema";
export { workspacesSchema } from "#project/workspaces/config/schemas/workspacesSchema";
// @end

// @barrel operations
export { resolveWorkspaces } from "#project/workspaces/operations/resolveWorkspaces";
// @end

// @barrel config/sections
export { discoverySection } from "#project/workspaces/config/sections/discoverySection";
export { scopesSection } from "#project/workspaces/config/sections/scopesSection";
export { workspacesOptionsSection } from "#project/workspaces/config/sections/workspacesOptionsSection";
export { workspacesSection } from "#project/workspaces/config/sections/workspacesSection";
// @end
