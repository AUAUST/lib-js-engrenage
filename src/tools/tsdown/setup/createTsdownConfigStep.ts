import { engrenage, tsdown, tsx, typescript } from "#constants";
import {
  createConfigModule,
  hasConfigFile,
  type Step,
} from "#project/steps/index";

export function createTsdownConfigStep(): Step {
  const file = `${tsdown}.config.ts`;

  return {
    name: file,
    message: `Create ${file}?`,
    async isMissing({ filesystem, hasDependency }) {
      return (
        (await hasDependency(tsdown)) && !hasConfigFile(filesystem, tsdown)
      );
    },
    async plan({ filesystem, addDevDependency }) {
      filesystem.write(
        file,
        createConfigModule({
          entry: `${engrenage}/tsdown`,
          definer: "defineTsdownConfig",
        }),
      );

      await addDevDependency(tsx);

      await addDevDependency(typescript);
    },
  };
}
