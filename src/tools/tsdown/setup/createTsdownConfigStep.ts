// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import { createConfigModule } from "#cli/utils/createConfigModule";
// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import { hasConfigFile } from "#cli/utils/hasConfigFile";
import { engrenage, tsdown, tsx, typescript } from "#constants";
// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import type { Step } from "#cli/types/Step";

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
