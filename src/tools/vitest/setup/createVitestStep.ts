import { vitest } from "#constants";
import { hasConfigFile, type Step } from "#project/steps/index";

export function createVitestStep(): Step {
  return {
    name: vitest,
    message: "Test with Vitest?",
    isMissing({ filesystem, hasDependency }) {
      return !hasDependency(vitest) && !hasConfigFile(filesystem, vitest);
    },
    plan({ addDevDependency }) {
      addDevDependency(vitest);
    },
  };
}
