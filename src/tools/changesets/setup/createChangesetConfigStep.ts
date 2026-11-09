import { changesetsCli } from "#constants";
import { configFile } from "#tools/changesets/constants";
import { createPnpmInvocation } from "#tools/pnpm/index";
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

      invoke(
        createPnpmInvocation(["changeset", "init"], { interactive: true }),
      );
    },
  };
}
