import { engrenage, tsdown, tsx, typescript } from "#constants";
import { createConfigModule } from "#project/steps/utils/createConfigModule";
import { hasConfigFile } from "#project/steps/utils/hasConfigFile";
import type { Step } from "#project/steps/types/Step";

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
