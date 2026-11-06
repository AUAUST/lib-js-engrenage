import { environmentSection } from "#project/config/index";
import { vscodeSection } from "#tools/vscode/config/vscodeSection";
import { extensionsFile } from "#tools/vscode/constants";
import { syncVscodeFiles } from "#tools/vscode/setup/syncVscodeFiles";
import { findIntegrations } from "#tools/vscode/utils/findIntegrations";
import type { Step } from "#project/steps/index";

export function createVscodeExtensionsStep(): Step {
  return {
    name: extensionsFile,
    message: "Recommend the VS Code extensions of the project tools?",
    async isMissing({ resolve, filesystem }) {
      const { hasDependency } = await resolve(environmentSection);

      const vscode = await resolve(vscodeSection);

      return (
        vscode.extensions !== false &&
        findIntegrations(hasDependency).length > 0 &&
        !(await filesystem.exists(extensionsFile))
      );
    },
    async plan(context) {
      await syncVscodeFiles(context, {
        extensions: true,
      });
    },
  };
}
