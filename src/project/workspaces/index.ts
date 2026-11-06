// @barrel types/*.ts all
export * from "#project/workspaces/types/ResolvedWorkspace";
export * from "#project/workspaces/types/ResolvedWorkspaceGroup";
export * from "#project/workspaces/types/WorkspaceTsconfig";
// @end

// @barrel config/*Schema.ts named
export { workspacesSchema } from "#project/workspaces/config/workspacesSchema";
// @end

// @barrel operations/*.ts named
export { resolveWorkspaces } from "#project/workspaces/operations/resolveWorkspaces";
// @end
