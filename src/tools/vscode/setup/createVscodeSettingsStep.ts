import { settingsFile } from "#tools/vscode/constants";
import { syncVscodeFiles } from "#tools/vscode/setup/syncVscodeFiles";
import { findIntegrations } from "#tools/vscode/utils/findIntegrations";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Environment } from "#project/config/index";
import type { Step } from "#project/steps/index";
import type { ResolvedVscode } from "#tools/vscode/types/ResolvedVscode";
import type { Directory } from "#types/Directory";

interface Sections {
  root: Directory;
  filesystem: Filesystem;
  resolve(...paths: string[]): string;
  environment: Environment;
  vscode: ResolvedVscode;
}

export function createVscodeSettingsStep(): Step<Sections> {
  return {
    name: settingsFile,
    message: "Add the VS Code settings of the project tools?",
    async isMissing({ get, filesystem }) {
      const { hasDependency } = await get("environment");

      const vscode = await get("vscode");

      return (
        vscode.settings !== false &&
        findIntegrations(hasDependency).length > 0 &&
        !filesystem.exists(settingsFile)
      );
    },
    async plan(context) {
      await syncVscodeFiles(context, {
        settings: true,
      });
    },
  };
}
