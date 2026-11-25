import {
  array,
  boolean,
  function_,
  looseObject,
  optional,
  picklist,
  string,
} from "valibot";
import type { StandardSchemaV1 } from "@standard-schema/spec";

import { freeze } from "@auaust/toolkit/object";

import { engrenage, pnpmWorkspaceFile } from "#constants";
import { metalbrain } from "#metalbrain/instructions/constants";
import { gitDirectory } from "#tools/git/constants";
import type { HookRoots } from "#metalbrain/runtimes/index";

export const agentsTarget = "agents";

export const compassFiller = "compass";

// @debt the missing-Compass text sits in `templates/`, which holds the starting content of agent files, because fragment conditions know only extensions and files, not config values
export const missingCompassTemplate = `${engrenage}/${metalbrain}/templates/compass.md`;

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

// @debt restates the `InstructionEntry` port as a schema, typed as StandardSchemaV1 to pass auaust/readonly-constants
export const instructionEntry: StandardSchemaV1 = looseObject({
  kind: picklist(["section", "rule", "skill"]),
  name: string(),
  category: string(),
  default: optional(boolean()),
  when: optional(function_()),
  paths: optional(array(string())),
  invocation: optional(picklist(["explicit", "implicit"])),
  formerly: optional(array(string())),
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
export { recordFiles } from "#metalbrain/kinds/constants";

// @debt re-exported only so the extension may import it under roles/extension/extension-imports
export { statsDirectory } from "#metalbrain/runtimes/constants";
