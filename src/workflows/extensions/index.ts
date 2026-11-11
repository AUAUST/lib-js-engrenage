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
export type { Prompter, Step, StepContext } from "#project/steps/index";
export type {
  SyncDone,
  SyncFlags,
  SyncRun,
  SyncTarget,
} from "#project/sync/index";

// @barrel utils/*.ts named
export { defineExtension } from "#workflows/extensions/utils/defineExtension";
// @end
