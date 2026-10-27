import { vitest } from "#constants";
import { hasConfigFile } from "#support/scaffold/utils/hasConfigFile";
import type { Step } from "#support/scaffold/types/Step";

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
