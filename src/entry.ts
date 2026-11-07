// @debt the root entry publishes functions of internal domains (`foundation/blocks`, `foundation/filesystem`, `foundation/options`), so "internal" does not mean unpublished
export {
  syncBlocks,
  syncFiles,
  syncIgnoreFile,
} from "#foundation/blocks/index";
export { filesIn } from "#foundation/filesystem/index";
export { buildOutDirSection, buildSection } from "#project/build/index";
export { cacheSection } from "#project/cache/index";
export { loadConfig } from "#project/config/index";
export {
  binOptionsSection,
  binSection,
  dataSection,
  defineSection,
  runtimeSection,
  scriptsOptionsSection,
  scriptsSection,
  sourceOptionsSection,
  sourceSection,
  testsOptionsSection,
  testsSection,
  toolingOptionsSection,
  toolingSection,
} from "#project/environments/index";
export { formatSection } from "#project/format/index";
export {
  environmentSection,
  packageJsonPathSection,
  packageJsonSection,
  visibilitySection,
} from "#project/package/index";
export {
  presetSection,
  traitAdjustmentsSection,
  traitsSection,
} from "#project/presets/index";
export {
  aliasesSection,
  environmentRolesSection,
  filesSection,
  importRulesSection,
  sourceExportsSection,
  structureOptionsSection,
  structureSection,
} from "#project/structure/index";
export {
  tsconfigPathSection,
  tsconfigSection,
  typescriptOptionsSection,
  typescriptSection,
} from "#project/tsconfig/index";
export { workspacesSection } from "#project/workspaces/index";
export { agentsSection } from "#tools/agents/index";
export { gitSection } from "#tools/git/index";
export { githubSection } from "#tools/github/index";
export { prettierSection } from "#tools/prettier/index";
export { vscodeSection } from "#tools/vscode/index";
export { debugSection } from "#workflows/cli/index";
export { loadValidatedConfig } from "#workflows/config/index";

export type { LoadedConfig } from "#project/config/index";

// @debt the global types role holds domain vocabulary: block types belong to `foundation/blocks`, sync results to the sync contract, `IgnorePresets` and `GlobGroup` to the ignore-file owner
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
export * from "#types/Resolvable";
export * from "#types/SyncResult";
export * from "#types/SyncResults";
export * from "#types/SyncStatus";
// @end
export { validate } from "#foundation/options/index";
