// @debt the root entry publishes functions of internal domains (`foundation/blocks`, `foundation/filesystem`, `foundation/options`, `workflows/registry`), so "internal" does not mean unpublished
export {
  syncBlocks,
  syncFiles,
  syncIgnoreFile,
} from "#foundation/blocks/index";
export { filesIn } from "#foundation/filesystem/index";
export {
  aliasesSection,
  binOptionsSection,
  binSection,
  buildSection,
  cacheSection,
  dataSection,
  debugSection,
  defineSection,
  environmentSection,
  filesSection,
  formatSection,
  importRulesSection,
  packageJsonPathSection,
  packageJsonSection,
  presetSection,
  rolesSection,
  runtimeSection,
  scriptsOptionsSection,
  scriptsSection,
  sourceExportsSection,
  sourceOptionsSection,
  sourceSection,
  structureSection,
  testsOptionsSection,
  testsSection,
  toolingOptionsSection,
  toolingSection,
  traitAdjustmentsSection,
  traitsSection,
  tsconfigSection,
  typescriptOptionsSection,
  typescriptSection,
  workspacesSection,
} from "#project/config/index";
export { agentsSection } from "#tools/agents/index";
export { gitSection } from "#tools/git/index";
export { githubSection } from "#tools/github/index";
export { prettierSection } from "#tools/prettier/index";
export { vscodeSection } from "#tools/vscode/index";
// @debt the section values are published from the root entry until their owning domains export them (#243–#246)
export { loadConfig } from "#workflows/registry/index";

export type { LoadedConfig } from "#project/config/index";

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
