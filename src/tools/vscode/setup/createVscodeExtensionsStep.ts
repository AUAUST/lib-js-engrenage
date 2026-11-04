import { extensionsFile } from "#tools/vscode/constants";
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

export function createVscodeExtensionsStep(): Step<Sections> {
  return {
    name: extensionsFile,
    message: "Recommend the VS Code extensions of the project tools?",
    isMissing({ get, filesystem, hasDependency }) {
      return (
        get("vscode").extensions !== false &&
        findIntegrations(hasDependency).length > 0 &&
        !filesystem.exists(extensionsFile)
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
          extensions: true,
        },
      );
    },
  };
}
