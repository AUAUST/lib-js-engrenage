// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import { createConfigModule } from "#cli/utils/createConfigModule";
// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import { hasConfigFile } from "#cli/utils/hasConfigFile";
import { engrenage, vite, vitest } from "#constants";
// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import type { Step } from "#cli/types/Step";

export function createVitestConfigStep(): Step {
  const file = `${vitest}.config.ts`;

  return {
    name: file,
    message: `Create ${file}?`,
    isMissing({ filesystem, hasDependency }) {
      return (
        hasDependency(vitest) &&
        !hasDependency(vite) &&
        !hasConfigFile(filesystem, vitest)
      );
    },
    plan({ filesystem }) {
      filesystem.write(
        file,
        createConfigModule({
          entry: `${engrenage}/vitest`,
          definer: "defineVitestConfig",
        }),
      );
    },
  };
}
