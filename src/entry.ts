// @debt the root entry publishes functions of internal domains (`foundation/blocks`, `foundation/filesystem`, `foundation/options`, `workflows/registry`), so "internal" does not mean unpublished
export {
  syncBlocks,
  syncFiles,
  syncIgnoreFile,
} from "#foundation/blocks/index";
export { filesIn } from "#foundation/filesystem/index";
export { loadConfig } from "#workflows/registry/index";
export type { Config } from "#workflows/registry/index";

// @debt the global types role holds domain vocabulary: block types belong to `foundation/blocks`, sync results to the sync contract, `PackageType` and `PublishAccess` to `project/package`, `IgnorePresets` and `GlobGroup` to the ignore-file owner
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
export { validate } from "#foundation/options/index";
