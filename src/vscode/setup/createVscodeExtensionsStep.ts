import { extensionsFile } from "#vscode/constants";
import { syncVscodeFiles } from "#vscode/setup/syncVscodeFiles";
import { findIntegrations } from "#vscode/utils/findIntegrations";
import type { Step } from "#support/scaffold/types/Step";

export function createVscodeExtensionsStep(): Step {
  return {
    name: extensionsFile,
    message: "Recommend the VS Code extensions of the project tools?",
    isMissing({ config, filesystem, hasDependency }) {
      return (
        config.vscode.extensions !== false &&
        findIntegrations(hasDependency).length > 0 &&
        !filesystem.exists(extensionsFile)
      );
    },
    plan({ config }) {
      syncVscodeFiles(config, {
        extensions: true,
      });
    },
  };
}
