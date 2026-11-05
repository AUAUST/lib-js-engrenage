import { engrenage } from "#constants";
import type { Step } from "#project/steps/index";

export function createDependencyStep(): Step {
  return {
    name: engrenage,
    message: `Add ${engrenage} to the devDependencies?`,
    async isMissing({ hasDependency }) {
      return !(await hasDependency(engrenage));
    },
    async plan({ addDevDependency }) {
      await addDevDependency(engrenage);
    },
  };
}
