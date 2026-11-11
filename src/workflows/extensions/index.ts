export {
  declare,
  declareList,
  declareLocation,
  declareManagedList,
  declareObject,
  declareRecord,
  declareSection,
} from "#foundation/options/index";
export { loadConfig, loadValidatedConfig } from "#project/config/index";
export type { HookEntry } from "#foundation/extensions/index";
export type { Filesystem } from "#foundation/filesystem/index";
export type { Section } from "#foundation/options/index";
export type {
  Extension,
  ExtensionSections,
  FileLocation,
  FileResource,
  LoadedConfig,
} from "#project/config/index";
export type {
  GateResult,
  GateRun,
  GateStage,
  GateStepEntry,
} from "#project/gate/index";
export type {
  ReexportMode,
  RoleFileResolver,
  RoleLocation,
  RoleLocationMember,
  RoleRuleLoader,
  RoleRuleModule,
  RoleRules,
} from "#project/roles/index";
export type { Prompter, Step, StepContext } from "#project/steps/index";
export type {
  CardinalityViolation,
  EnvironmentFileNames,
  EnvironmentStructure,
  ResolvedRoleContract,
  ResolvedRoleExports,
  ResolvedStructure,
  StructureKind,
  StructureMirror,
  StructureNode,
  StructureRelation,
  StructureRole,
  StructureSource,
  UnclassifiedReason,
} from "#project/structure/index";
export type {
  SyncDone,
  SyncFlags,
  SyncRun,
  SyncTarget,
} from "#project/sync/index";
export type {
  BarrelExport,
  BarrelExportsEntry,
  BarrelExportsResolver,
} from "#tools/typescript/index";

// @barrel utils
export { defineExtension } from "#workflows/extensions/utils/defineExtension";
// @end
