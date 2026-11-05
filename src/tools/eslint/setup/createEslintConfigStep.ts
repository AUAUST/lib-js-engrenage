import { engrenage, eslint, typescript } from "#constants";
import {
  createConfigModule,
  hasConfigFile,
  type Step,
} from "#project/steps/index";

export function createEslintConfigStep(): Step {
  const file = `${eslint}.config.ts`;

  return {
    name: file,
    message: "Lint with ESLint?",
    async isMissing({ filesystem }) {
      return (
        !(await filesystem.exists(file)) &&
        !(await hasConfigFile(filesystem, eslint))
      );
    },
    async plan({ filesystem, addDevDependency }) {
      await filesystem.write(
        file,
        createConfigModule({
          entry: `${engrenage}/eslint`,
          definer: "defineEslintConfig",
        }),
      );

      await addDevDependency(eslint);

      await addDevDependency(typescript);
    },
  };
}
