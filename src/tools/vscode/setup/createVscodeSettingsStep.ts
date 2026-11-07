import { environmentSection } from "#project/package/index";
import { vscodeSection } from "#tools/vscode/config/sections/vscodeSection";
import { settingsFile } from "#tools/vscode/constants";
import { syncVscodeFiles } from "#tools/vscode/setup/syncVscodeFiles";
import { findIntegrations } from "#tools/vscode/utils/findIntegrations";
import type { Step } from "#project/steps/index";

export function createVscodeSettingsStep(): Step {
  return {
    name: settingsFile,
    message: "Add the VS Code settings of the project tools?",
    async isMissing({ resolve, filesystem }) {
      const { hasDependency } = await resolve(environmentSection);

      const vscode = await resolve(vscodeSection);

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
