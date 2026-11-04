import { engrenage, eslint, typescript } from "#constants";
import { createConfigModule } from "#project/steps/utils/createConfigModule";
import { hasConfigFile } from "#project/steps/utils/hasConfigFile";
import type { Step } from "#project/steps/types/Step";

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
