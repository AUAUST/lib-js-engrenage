import { baselineBrowserMapping, nodeReleases } from "#constants";
import type { Step } from "#project/steps/index";

const dataPackages = [baselineBrowserMapping, nodeReleases] as const;

export function createRuntimeDataStep(): Step {
  return {
    name: "runtime data",
    message: `Add ${dataPackages.join(", ")} to the devDependencies?`,
    async isMissing({ hasDependency }) {
      for (const name of dataPackages) {
        if (!(await hasDependency(name))) {
          return true;
        }
      }

      return false;
    },
    async plan({ addDevDependency }) {
      for (const name of dataPackages) {
        await addDevDependency(name);
      }
    },
  };
}
