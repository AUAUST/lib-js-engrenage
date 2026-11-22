import { stateDirectory } from "#project/config/constants";
import type { File } from "#types/File";

export const wordCapsFile = `${stateDirectory}/word-caps.json` satisfies File;

export const formerWordCapsFile = `${stateDirectory}/word-budgets.json` satisfies File;

export const claudeTarget = "claude";

// @debt re-exported only so the extension may import it under roles/extension/extension-imports
export { claudeFile, claudeSettingsFile } from "#tools/agents/constants";
