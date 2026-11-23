export { createNamespaceKindPreset } from "#batiment/scopes/index";
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
export type {
  StructureDiagnostic,
  StructureDiagnosticCode,
} from "#batiment/report/index";
export type {
  ReexportMode,
  RoleLocation,
  RoleLocationMember,
  RoleRules,
} from "#batiment/roles/index";
export type {
  ResolvedRoleContract,
  ResolvedRoleExports,
} from "#batiment/roles/index";
export type {
  InwardPolicy,
  NamespaceKind,
  NamespaceKindPreset,
  NamespaceRelation,
  TestVariant,
} from "#batiment/scopes/index";
export type {
  CardinalityViolation,
  EnvironmentFileNames,
  EnvironmentStructure,
  ResolvedStructure,
  StructureKind,
  StructureMirror,
  StructureNode,
  StructureRelation,
  StructureReport,
  StructureRole,
  StructureSource,
  UnclassifiedReason,
} from "#batiment/structure/index";
export type { HookEntry } from "#foundation/extensions/index";
export type { Filesystem } from "#foundation/filesystem/index";
export type { Section } from "#foundation/options/index";
export type {
  ReportData,
  Reporter,
  ReportingContext,
} from "#foundation/reports/index";
export type {
  Extension,
  ExtensionSections,
  FileLocation,
  FileResource,
  LoadedConfig,
} from "#project/config/index";
export type {
  GateCheck,
  GateResult,
  GateRun,
  GateStage,
  GateStepEntry,
} from "#project/gate/index";
export type { Prompter, Step, StepContext } from "#project/steps/index";
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
