import { vitest } from "#constants";
import { hasConfigFile, type Step } from "#project/steps/index";

export function createVitestStep(): Step {
  return {
    name: vitest,
    message: "Test with Vitest?",
    async isMissing({ filesystem, hasDependency }) {
      return (
        !(await hasDependency(vitest)) &&
        !(await hasConfigFile(filesystem, vitest))
      );
    },
    async plan({ addDevDependency }) {
      await addDevDependency(vitest);
    },
  };
}
