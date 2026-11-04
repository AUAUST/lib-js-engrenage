import { vitest } from "#constants";
import { hasConfigFile } from "#project/steps/utils/hasConfigFile";
import type { Step } from "#project/steps/types/Step";

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
