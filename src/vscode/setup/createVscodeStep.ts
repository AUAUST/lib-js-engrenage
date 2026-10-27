import { emptyObjectFile } from "#support/json/constants";
import { extensionsFile, settingsFile } from "#vscode/constants";
import { findIntegrations } from "#vscode/utils/findIntegrations";
import type { Step } from "#support/scaffold/types/Step";
import type { StepContext } from "#support/scaffold/types/StepContext";
import type { File } from "#types/File";

function findMissingFiles({
  config,
  files,
  hasDependency,
}: StepContext): ReadonlyArray<File> {
  if (findIntegrations(hasDependency).length === 0) {
    return [];
  }

  const { settings, extensions } = config.vscode;

  const enabled = [
    ...(settings === false ? [] : [settingsFile]),
    ...(extensions === false ? [] : [extensionsFile]),
  ];

  return enabled.filter((file) => !files.exists(file));
}

export function createVscodeStep(): Step {
  return {
    name: ".vscode",
    message: "Add the VS Code settings and extension recommendations?",
    isMissing(context) {
      return findMissingFiles(context).length > 0;
    },
    plan(context) {
      for (const file of findMissingFiles(context)) {
        context.files.write(file, emptyObjectFile);
      }
    },
  };
}
