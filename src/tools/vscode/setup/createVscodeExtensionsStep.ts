import { extensionsFile } from "#tools/vscode/constants";
import { syncVscodeFiles } from "#tools/vscode/setup/syncVscodeFiles";
import { findIntegrations } from "#tools/vscode/utils/findIntegrations";
// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import type { Step } from "#workflows/cli/types/Step";

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
