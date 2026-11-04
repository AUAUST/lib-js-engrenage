import { typescript } from "#constants";
// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import type { Step } from "#workflows/cli/types/Step";

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
