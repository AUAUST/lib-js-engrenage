export { resolvePathAliases } from "#tsconfig/utils/resolvePathAliases";
export { syncEnvFile } from "#typescript/setup/syncEnvFile";
export { inferType } from "#typescript/utils/inferType";
export { resolveImportSpecifier } from "#typescript/utils/resolveImportSpecifier";
export { syncBarrels } from "#typescript/utils/syncBarrels";

// @barrel types/*.ts all
export * from "#typescript/types/BarrelMode";
// @end
export * from "#baseline/types/ApiGroup";
export * from "#package/types/SubpathImports";
export * from "#tsconfig/types/PathAlias";
export * from "#tsconfig/types/PathAliases";
export * from "#tsconfig/types/Paths";
export * from "#tsconfig/types/Tsconfig";
export * from "#tsconfig/types/TsconfigProducer";
export * from "#tsconfig/types/TsconfigTarget";
