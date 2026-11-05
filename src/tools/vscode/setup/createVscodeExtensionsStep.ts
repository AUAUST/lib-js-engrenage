import { extensionsFile } from "#tools/vscode/constants";
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

export function createVscodeExtensionsStep(): Step<Sections> {
  return {
    name: extensionsFile,
    message: "Recommend the VS Code extensions of the project tools?",
    async isMissing({ get, filesystem }) {
      const { hasDependency } = await get("environment");

      const vscode = await get("vscode");

      return (
        vscode.extensions !== false &&
        findIntegrations(hasDependency).length > 0 &&
        !filesystem.exists(extensionsFile)
      );
    },
    async plan(context) {
      await syncVscodeFiles(context, {
        extensions: true,
      });
    },
  };
}
