import { settingsFile } from "#tools/vscode/constants";
import { syncVscodeFiles } from "#tools/vscode/setup/syncVscodeFiles";
import { findIntegrations } from "#tools/vscode/utils/findIntegrations";
import type { Step } from "#project/steps/index";

export function createVscodeSettingsStep(): Step {
  return {
    name: settingsFile,
    message: "Add the VS Code settings of the project tools?",
    async isMissing({ resolve, filesystem }) {
      const { hasDependency } = await resolve("environment");

      const vscode = await resolve("vscode");

      return (
        vscode.settings !== false &&
        findIntegrations(hasDependency).length > 0 &&
        !(await filesystem.exists(settingsFile))
      );
    },
    async plan(context) {
      await syncVscodeFiles(context, {
        settings: true,
      });
    },
  };
}
