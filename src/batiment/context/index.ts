// @barrel apis
export type * from "#batiment/context/apis/LoadedContext";
// @end

// @barrel ports
export type * from "#batiment/context/ports/ContextPort";
// @end

// @barrel types
export type * from "#batiment/context/types/ContextDiscovery";
export type * from "#batiment/context/types/EnvironmentDeclarations";
export type * from "#batiment/context/types/ExpectedWorkspaces";
export type * from "#batiment/context/types/NamespaceDiscovery";
export type * from "#batiment/context/types/NamespacePlacement";
export type * from "#batiment/context/types/RootFacts";
export type * from "#batiment/context/types/ScopeDeclarations";
export type * from "#batiment/context/types/WorkspaceExpectation";
// @end

// @debt `load` is exported by hand outside any barrel block, since a block lists every module of its role and the other operations must stay private
export { load } from "#batiment/context/operations/load";
