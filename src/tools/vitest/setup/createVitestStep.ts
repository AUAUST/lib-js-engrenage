// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import { hasConfigFile } from "#cli/utils/hasConfigFile";
import { vitest } from "#constants";
// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import type { Step } from "#cli/types/Step";

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
