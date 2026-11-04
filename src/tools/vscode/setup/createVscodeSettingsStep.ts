import { settingsFile } from "#tools/vscode/constants";
import { syncVscodeFiles } from "#tools/vscode/setup/syncVscodeFiles";
import { findIntegrations } from "#tools/vscode/utils/findIntegrations";
import type { Environment } from "#project/config/types/Environment";
import type { Step } from "#project/steps/types/Step";
import type { ResolvedVscode } from "#tools/vscode/types/ResolvedVscode";
import type { Directory } from "#types/Directory";

interface Sections {
  root: Directory;
  resolve(...paths: string[]): string;
  environment: Environment;
  vscode: ResolvedVscode;
}

export function createVscodeSettingsStep(): Step<Sections> {
  return {
    name: settingsFile,
    message: "Add the VS Code settings of the project tools?",
    isMissing({ get, filesystem, hasDependency }) {
      return (
        get("vscode").settings !== false &&
        findIntegrations(hasDependency).length > 0 &&
        !filesystem.exists(settingsFile)
      );
    },
    async plan({ get, filesystem }) {
      await syncVscodeFiles(
        {
          root: get("root"),
          filesystem,
          resolve: get("resolve"),
          environment: get("environment"),
          vscode: get("vscode"),
        },
        {
          settings: true,
        },
      );
    },
  };
}
