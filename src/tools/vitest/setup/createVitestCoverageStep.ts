import { vitest, vitestCoverageIstanbul } from "#constants";
import type { Step } from "#project/steps/index";

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
