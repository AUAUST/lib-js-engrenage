import { engrenage } from "#constants";
import type { Step } from "#support/scaffold/types/Step";

export function createDependencyStep(): Step {
  return {
    name: engrenage,
    message: `Add ${engrenage} to the devDependencies?`,
    isMissing({ hasDependency }) {
      return !hasDependency(engrenage);
    },
    plan({ addDevDependency }) {
      addDevDependency(engrenage);
    },
  };
}
