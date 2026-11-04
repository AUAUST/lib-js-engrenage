import { typescript } from "#constants";
import type { Step } from "#project/steps/types/Step";

export function createTypescriptStep(): Step {
  return {
    name: typescript,
    message: "Add TypeScript?",
    isMissing({ hasDependency }) {
      return !hasDependency(typescript);
    },
    plan({ addDevDependency }) {
      addDevDependency(typescript, {
        exact: true,
      });
    },
  };
}
