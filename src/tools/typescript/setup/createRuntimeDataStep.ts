import { baselineBrowserMapping, nodeReleases } from "#constants";
import type { Step } from "#project/steps/types/Step";

const dataPackages = [baselineBrowserMapping, nodeReleases] as const;

export function createRuntimeDataStep(): Step {
  return {
    name: "runtime data",
    message: `Add ${dataPackages.join(", ")} to the devDependencies?`,
    isMissing({ hasDependency }) {
      return dataPackages.some((name) => !hasDependency(name));
    },
    plan({ addDevDependency }) {
      for (const name of dataPackages) {
        addDevDependency(name);
      }
    },
  };
}
