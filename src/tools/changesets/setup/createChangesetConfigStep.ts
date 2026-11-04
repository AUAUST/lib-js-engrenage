import { changesetsCli } from "#constants";
import { configFile } from "#tools/changesets/constants";
// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import type { Step } from "#workflows/cli/types/Step";

export function createChangesetConfigStep(): Step {
  return {
    name: configFile,
    message: "Version and publish with changesets?",
    isMissing({ filesystem }) {
      return !filesystem.exists(configFile);
    },
    plan({ addDevDependency, invoke }) {
      addDevDependency(changesetsCli);

      // @debt hand-written pnpm invocation, like those in createStepContext and bin/engrenage/init.ts
      invoke({
        command: "pnpm",
        args: ["changeset", "init"],
        interactive: true,
      });
    },
  };
}
