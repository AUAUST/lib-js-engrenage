// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import { createConfigModule } from "#workflows/cli/utils/createConfigModule";
// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import { engrenage, vite, vitest } from "#constants";
import { hasConfigFile } from "#workflows/cli/operations/hasConfigFile";
// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import type { Step } from "#workflows/cli/types/Step";

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
