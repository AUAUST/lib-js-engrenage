// @barrel setup/*.ts named
export { createRuntimeDataStep } from "#tools/typescript/setup/createRuntimeDataStep";
export { createSourceEntryStep } from "#tools/typescript/setup/createSourceEntryStep";
export { createTypescriptStep } from "#tools/typescript/setup/createTypescriptStep";
export { syncAliases } from "#tools/typescript/setup/syncAliases";
export { syncEnvFile } from "#tools/typescript/setup/syncEnvFile";
export { syncTsconfigFiles } from "#tools/typescript/setup/syncTsconfigFiles";
export { syncWorkspaceFiles } from "#tools/typescript/setup/syncWorkspaceFiles";
// @end

export { resolvePathAliases } from "#project/tsconfig/index";
export { syncBarrels } from "#tools/typescript/operations/syncBarrels";
export { inferType } from "#tools/typescript/utils/inferType";
export { resolveImportSpecifier } from "#tools/typescript/utils/resolveImportSpecifier";

// @barrel types/*.ts all
export * from "#tools/typescript/types/BarrelMode";
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
