import { engrenage, eslint, typescript } from "#constants";
import { createConfigModule } from "#support/scaffold/utils/createConfigModule";
import { hasConfigFile } from "#support/scaffold/utils/hasConfigFile";
import type { Step } from "#support/scaffold/types/Step";

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
