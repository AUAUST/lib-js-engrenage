export { resolvePathAliases } from "#project/tsconfig/operations/resolvePathAliases";
export { syncBarrels } from "#tools/typescript/operations/syncBarrels";
export { syncEnvFile } from "#tools/typescript/setup/syncEnvFile";
export { inferType } from "#tools/typescript/utils/inferType";
export { resolveImportSpecifier } from "#tools/typescript/utils/resolveImportSpecifier";

// @barrel types/*.ts all
export * from "#tools/typescript/types/BarrelMode";
// @end
export * from "#project/baseline/types/ApiGroup";
export * from "#project/package/types/SubpathImports";
export * from "#project/tsconfig/types/PathAlias";
export * from "#project/tsconfig/types/PathAliases";
export * from "#project/tsconfig/types/Paths";
export * from "#project/tsconfig/types/Tsconfig";
export * from "#project/tsconfig/types/TsconfigProducer";
export * from "#project/tsconfig/types/TsconfigTarget";
