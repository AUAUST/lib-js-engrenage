import { extensionsFile } from "#tools/vscode/constants";
import { syncVscodeFiles } from "#tools/vscode/setup/syncVscodeFiles";
import { findIntegrations } from "#tools/vscode/utils/findIntegrations";
import type { Step } from "#project/steps/types/Step";

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
    async plan({ config }) {
      await syncVscodeFiles(config, {
        extensions: true,
      });
    },
  };
}
