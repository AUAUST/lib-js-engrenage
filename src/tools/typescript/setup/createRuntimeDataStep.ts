import { baselineBrowserMapping, nodeReleases } from "#constants";
// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import type { Step } from "#cli/types/Step";

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
