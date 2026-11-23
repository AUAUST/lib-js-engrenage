// @barrel apis
export type * from "#batiment/context/apis/LoadedContext";
// @end

// @barrel ports
export type * from "#batiment/context/ports/ContextPort";
// @end

// @barrel types
export type * from "#batiment/context/types/ContextDiscovery";
export type * from "#batiment/context/types/EnvironmentDeclarations";
export type * from "#batiment/context/types/EnvironmentDiscovery";
export type * from "#batiment/context/types/EnvironmentPlacement";
export type * from "#batiment/context/types/ExpectedWorkspaces";
export type * from "#batiment/context/types/RootFacts";
export type * from "#batiment/context/types/ScopeDeclarations";
export type * from "#batiment/context/types/WorkspaceExpectation";
// @end

// @barrel operations
export { discoverContext } from "#batiment/context/operations/discoverContext";
export { load } from "#batiment/context/operations/load";
export { walkScope } from "#batiment/context/operations/walkScope";
// @end
