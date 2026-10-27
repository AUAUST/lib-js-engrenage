import { configFile } from "#changesets/constants";
import { changesetsCli } from "#constants";
import { emptyObjectFile } from "#support/json/constants";
import type { Step } from "#support/scaffold/types/Step";

export function createChangesetConfigStep(): Step {
  return {
    name: configFile,
    message: `Create ${configFile}?`,
    isMissing({ files, hasDependency }) {
      return hasDependency(changesetsCli) && !files.exists(configFile);
    },
    plan({ files }) {
      files.write(configFile, emptyObjectFile);
    },
  };
}
