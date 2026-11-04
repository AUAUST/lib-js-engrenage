// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import { createConfigModule } from "#cli/utils/createConfigModule";
// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import { hasConfigFile } from "#cli/utils/hasConfigFile";
import { engrenage, eslint, typescript } from "#constants";
// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import type { Step } from "#cli/types/Step";

export function createEslintConfigStep(): Step {
  const file = `${eslint}.config.ts`;

  return {
    name: file,
    message: "Lint with ESLint?",
    isMissing({ filesystem }) {
      return !filesystem.exists(file) && !hasConfigFile(filesystem, eslint);
    },
    plan({ filesystem, addDevDependency }) {
      filesystem.write(
        file,
        createConfigModule({
          entry: `${engrenage}/eslint`,
          definer: "defineEslintConfig",
        }),
      );

      addDevDependency(eslint);

      addDevDependency(typescript);
    },
  };
}
