import { typescript } from "#constants";
import type { Step } from "#project/steps/index";

export function createTypescriptStep(): Step {
  return {
    name: typescript,
    message: "Add TypeScript?",
    async isMissing({ hasDependency }) {
      return !(await hasDependency(typescript));
    },
    async plan({ addDevDependency }) {
      await addDevDependency(typescript, {
        exact: true,
      });
    },
  };
}
