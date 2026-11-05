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
    isMissing({ filesystem, hasDependency }) {
      return hasDependency(tsdown) && !hasConfigFile(filesystem, tsdown);
    },
    plan({ filesystem, addDevDependency }) {
      filesystem.write(
        file,
        createConfigModule({
          entry: `${engrenage}/tsdown`,
          definer: "defineTsdownConfig",
        }),
      );

      addDevDependency(tsx);

      addDevDependency(typescript);
    },
  };
}
