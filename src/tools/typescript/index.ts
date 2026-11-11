// @barrel setup
export { createRuntimeDataStep } from "#tools/typescript/setup/createRuntimeDataStep";
export { createSourceEntryStep } from "#tools/typescript/setup/createSourceEntryStep";
export { createTypescriptStep } from "#tools/typescript/setup/createTypescriptStep";
export { syncAliases } from "#tools/typescript/setup/syncAliases";
export { syncBarrelBlocks } from "#tools/typescript/setup/syncBarrelBlocks";
export { syncBarrelFiles } from "#tools/typescript/setup/syncBarrelFiles";
export { syncEnvFile } from "#tools/typescript/setup/syncEnvFile";
export { syncTsconfigFiles } from "#tools/typescript/setup/syncTsconfigFiles";
export { syncWorkspaceFiles } from "#tools/typescript/setup/syncWorkspaceFiles";
// @end

export { resolvePathAliases } from "#project/tsconfig/index";
export { createLibraryCompiler } from "#tools/typescript/operations/createLibraryCompiler";
export { formatModule } from "#tools/typescript/operations/formatModule";
export { resolveTscArguments } from "#tools/typescript/operations/resolveTscArguments";
export { resolveTscDistArguments } from "#tools/typescript/operations/resolveTscDistArguments";
export { inferType } from "#tools/typescript/utils/inferType";
export { resolveImportSpecifier } from "#tools/typescript/utils/resolveImportSpecifier";

// @barrel ports
export type * from "#tools/typescript/ports/BarrelExportsEntry";
export type * from "#tools/typescript/ports/BarrelExportsResolver";
// @end

// @barrel types
export type * from "#tools/typescript/types/BarrelExport";
export type * from "#tools/typescript/types/BarrelModule";
export type * from "#tools/typescript/types/BarrelPlan";
export type * from "#tools/typescript/types/TsconfigEnvironment";
// @end
export type { ApiGroup } from "#project/baseline/index";
export type { SubpathImports } from "#project/package/index";
export type {
  PathAlias,
  PathAliases,
  Paths,
  Tsconfig,
  TsconfigProducer,
  TsconfigTarget,
} from "#project/tsconfig/index";
