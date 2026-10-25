// @reference config/typescript
export * from "#config/typescript/barrelFiles";
export * from "#config/typescript/typescriptBlocks";
// @end

export type { PathAlias } from "#typescript/types/PathAlias";
export type { Paths } from "#typescript/types/Paths";
export type { SubpathImports } from "#typescript/types/SubpathImports";
export { readCompilerOptions } from "#typescript/utils/readCompilerOptions";
export { readSubpathImports } from "#typescript/utils/readSubpathImports";
export { resolveImportSpecifier } from "#typescript/utils/resolveImportSpecifier";
export { resolvePathAliases } from "#typescript/utils/resolvePathAliases";
export { syncBarrels } from "#typescript/utils/syncBarrels";
