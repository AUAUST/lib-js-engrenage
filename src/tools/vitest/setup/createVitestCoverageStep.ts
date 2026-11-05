import { vitest, vitestCoverageIstanbul } from "#constants";
import type { Step } from "#project/steps/index";

export function createVitestCoverageStep(): Step {
  return {
    name: vitestCoverageIstanbul,
    message: "Want coverage?",
    async isMissing({ hasDependency }) {
      return (
        (await hasDependency(vitest)) &&
        !(await hasDependency(vitestCoverageIstanbul))
      );
    },
    async plan({ addDevDependency }) {
      await addDevDependency(vitestCoverageIstanbul);
    },
  };
}
