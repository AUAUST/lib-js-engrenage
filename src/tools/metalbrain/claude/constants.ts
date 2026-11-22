import { stateDirectory } from "#project/config/constants";
import type { File } from "#types/File";

export const wordBudgetsFile = `${stateDirectory}/word-budgets.json` satisfies File;

export const claudeTarget = "claude";

// @debt re-exports the constants of `tools/agents/claude` and a name moved to `metalbrain/runtimes` so the `agents/claude/constants` subpath keeps them; consumers should import them from their owning domain
export { claudeShellVariable } from "#metalbrain/runtimes/constants";

export {
  claudeAgentsDir,
  claudeBinary,
  claudeBudgetHookArgs,
  claudeFile,
  claudeHiddenAttribution,
  claudeHookMarkers,
  claudeHooks,
  claudePermissions,
  claudeRulesGlob,
  claudeSessionVariable,
  claudeSettingsFile,
  claudeSkillsDir,
  claudeStopHook,
  claudeVariables,
  mainRole,
  metalbrainHook,
} from "#tools/agents/constants";
