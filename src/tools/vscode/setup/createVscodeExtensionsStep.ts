import { extensionsFile } from "#vscode/constants";
import { syncVscodeFiles } from "#vscode/setup/syncVscodeFiles";
import { findIntegrations } from "#vscode/utils/findIntegrations";
// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import type { Step } from "#cli/types/Step";

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
