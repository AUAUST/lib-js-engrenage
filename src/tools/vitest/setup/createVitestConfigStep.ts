import { engrenage, vite, vitest } from "#constants";
import { createConfigModule } from "#project/steps/utils/createConfigModule";
import { hasConfigFile } from "#project/steps/utils/hasConfigFile";
import type { Step } from "#project/steps/types/Step";

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
