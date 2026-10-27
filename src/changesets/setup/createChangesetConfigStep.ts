import { configFile } from "#changesets/constants";
import { changesetsCli } from "#constants";
import type { Step } from "#support/scaffold/types/Step";

export function createChangesetConfigStep(): Step {
  return {
    name: configFile,
    message: "Version and publish with changesets?",
    isMissing({ filesystem }) {
      return !filesystem.exists(configFile);
    },
    plan({ addDevDependency, invoke }) {
      addDevDependency(changesetsCli);

      invoke({
        command: "pnpm",
        args: ["changeset", "init"],
        interactive: true,
      });
    },
  };
}
