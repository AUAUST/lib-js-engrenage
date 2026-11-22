import { function_, looseObject, optional, string } from "valibot";
import type { StandardSchemaV1 } from "@standard-schema/spec";

import { freeze } from "@auaust/toolkit/object";

export const agentsTarget = "agents";

// @debt typed as StandardSchemaV1 to pass auaust/readonly-constants, erasing the validator's output type
export const agentRuntimeEntry: StandardSchemaV1 = looseObject({
  name: string(),
  title: optional(string()),
  dispatcher: optional(looseObject({ load: function_() })),
  skills: optional(string()),
  agents: optional(string()),
});

// @debt typed as StandardSchemaV1 to pass auaust/readonly-constants, erasing the validator's output type
export const agentLoaderEntry: StandardSchemaV1 = looseObject({
  name: string(),
  load: function_(),
});

export const codexRemoval = "Codex support was removed; drop it from the config, then run engrenage sync to delete the Codex files it generated";

export const removedRuntimes: Readonly<Record<string, string>> = freeze({
  codex: codexRemoval,
});

export const addRuleCommand = "pnpm engrenage agents rules add";

// @debt re-exports the constants of `tools/agents` so the `agents/constants` subpath keeps them; consumers should import them from their owning domain
export {
  agentLogFiles,
  agentOutcomes,
  agentRunExtensions,
  agentsFile,
  agentShellVariables,
  agentStatsDirectory,
  agentsTemplate,
  attributionRules,
  backlogCategoriesHeading,
  backlogTemplate,
  budgetKinds,
  budgetModes,
  builtInFillers,
  claudeAgentFrontmatterKeys,
  claudeSkillFrontmatterKeys,
  defaultBudgetMode,
  defaultBudgets,
  defaultInstructionFiles,
  defaultOutputLimit,
  defaultSubagentCacheTtl,
  efforts,
  endMarker,
  fastTier,
  formerCodexFiles,
  handoffsDirectory,
  hookEvents,
  mainAgent,
  mainSharedDirectory,
  mainSharedFiles,
  markdownBlocks,
  metalbrain,
  preserveDirective,
  reportMarkers,
  retiredRules,
  ruleFrontmatterKeys,
  rulesDirectory,
  scratchpadFile,
  scratchpadPlaceholder,
  sharedFilesKind,
  skillFileName,
  skillFrontmatterKeys,
  standardTier,
  subagentCacheTtls,
  tableCellWords,
  tokenWeights,
  unknownModel,
} from "#tools/agents/constants";
