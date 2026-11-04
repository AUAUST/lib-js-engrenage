import { vitest, vitestCoverageIstanbul } from "#constants";
// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import type { Step } from "#workflows/cli/types/Step";

export function createVitestCoverageStep(): Step {
  return {
    name: vitestCoverageIstanbul,
    message: "Want coverage?",
    isMissing({ hasDependency }) {
      return hasDependency(vitest) && !hasDependency(vitestCoverageIstanbul);
    },
    plan({ addDevDependency }) {
      addDevDependency(vitestCoverageIstanbul);
    },
  };
}
