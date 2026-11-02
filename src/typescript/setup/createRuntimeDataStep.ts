import {
  baselineBrowserMapping,
  nodeReleases,
  typescriptBaselineLibrary,
} from "#constants";
import type { Step } from "#support/scaffold/types/Step";

const dataPackages = [
  baselineBrowserMapping,
  nodeReleases,
  typescriptBaselineLibrary,
] as const;

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
