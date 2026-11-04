export { syncFiles } from "#foundation/blocks/operations/syncFiles";
export { syncIgnoreFile } from "#foundation/blocks/operations/syncIgnoreFile";
export { syncBlocks } from "#foundation/blocks/utils/syncBlocks";
export { filesIn } from "#foundation/filesystem/utils/filesIn";
export { loadConfig } from "#workflows/registry/operations/loadConfig";
export type { Config } from "#workflows/registry/types/Config";
/** @debt the root entry imports foundation and project modules directly instead of through their `index.ts` surfaces, which the environment-root rule allows only for public surfaces */

// @barrel types/*.ts all
export * from "#types/BlockFillers";
export * from "#types/BlockSyntax";
export * from "#types/Directories";
export * from "#types/Directory";
export * from "#types/File";
export * from "#types/Files";
export * from "#types/FileSync";
export * from "#types/Glob";
export * from "#types/GlobGroup";
export * from "#types/Globs";
export * from "#types/IgnorePresets";
export * from "#types/KnownPackageName";
export * from "#types/PackageName";
export * from "#types/PackageNames";
export * from "#types/PackageType";
export * from "#types/PublishAccess";
export * from "#types/Resolvable";
export * from "#types/SyncResult";
export * from "#types/SyncResults";
export * from "#types/SyncStatus";
// @end
export { validate } from "#foundation/options/utils/validate";
