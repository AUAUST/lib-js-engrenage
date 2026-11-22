import { function_, looseObject, optional, string } from "valibot";
import type { StandardSchemaV1 } from "@standard-schema/spec";

import { freeze } from "@auaust/toolkit/object";

import { pnpmWorkspaceFile } from "#constants";
import { gitDirectory } from "#tools/git/constants";
import type { HookRoots } from "#metalbrain/runtimes/index";

export const agentsTarget = "agents";

export const hookRoots: HookRoots = freeze({
  repository: gitDirectory,
  workspace: pnpmWorkspaceFile,
});

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

export const addRuleCommand = "pnpm metalbrain agents rules add";

// @debt re-exported only so the extension may import it under roles/extension/extension-imports
export {
  markdownBlocks,
  rulesDirectory,
} from "#metalbrain/instructions/constants";

// @debt re-exported only so the extension may import it under roles/extension/extension-imports
export { agentLogFiles } from "#metalbrain/records/constants";

// @debt re-exported only so the extension may import it under roles/extension/extension-imports
export { statsDirectory } from "#metalbrain/runtimes/constants";
