import { settingsFile } from "#vscode/constants";
import { syncVscodeFiles } from "#vscode/setup/syncVscodeFiles";
import { findIntegrations } from "#vscode/utils/findIntegrations";
import type { Step } from "#support/scaffold/types/Step";

export function createVscodeSettingsStep(): Step {
  return {
    name: settingsFile,
    message: "Add the VS Code settings of the project tools?",
    isMissing({ config, filesystem, hasDependency }) {
      return (
        config.vscode.settings !== false &&
        findIntegrations(hasDependency).length > 0 &&
        !filesystem.exists(settingsFile)
      );
    },
    async plan({ config }) {
      await syncVscodeFiles(config, {
        settings: true,
      });
    },
  };
}
