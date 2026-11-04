import { settingsFile } from "#tools/vscode/constants";
import { syncVscodeFiles } from "#tools/vscode/setup/syncVscodeFiles";
import { findIntegrations } from "#tools/vscode/utils/findIntegrations";
// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import type { Step } from "#workflows/cli/types/Step";

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
