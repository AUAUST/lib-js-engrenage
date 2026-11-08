import { changesetsCli } from "#constants";
import { configFile } from "#tools/changesets/constants";
import type { Step } from "#project/steps/index";

export function createChangesetConfigStep(): Step {
  return {
    name: configFile,
    message: "Version and publish with changesets?",
    async isMissing({ filesystem }) {
      return !(await filesystem.exists(configFile));
    },
    async plan({ addDevDependency, invoke }) {
      await addDevDependency(changesetsCli);

      // @debt hand-written pnpm invocation, like those in createStepContext and bin/engrenage/actions/init.ts
      invoke({
        command: "pnpm",
        args: ["changeset", "init"],
        interactive: true,
      });
    },
  };
}
