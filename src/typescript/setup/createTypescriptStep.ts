import { typescript } from "#constants";
import type { Step } from "#support/scaffold/types/Step";

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
