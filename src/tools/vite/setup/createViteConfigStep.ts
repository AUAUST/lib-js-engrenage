// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import { createConfigModule } from "#cli/utils/createConfigModule";
// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import { hasConfigFile } from "#cli/utils/hasConfigFile";
import { engrenage, vite, vitest } from "#constants";
// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import type { Step } from "#cli/types/Step";

export function createViteConfigStep(): Step {
  const file = `${vite}.config.ts`;

  return {
    name: file,
    message: `Create ${file}?`,
    isMissing({ filesystem, hasDependency }) {
      return hasDependency(vite) && !hasConfigFile(filesystem, vite);
    },
    plan({ filesystem, hasDependency }) {
      const tested = hasDependency(vitest);

      filesystem.write(
        file,
        createConfigModule({
          entry: `${engrenage}/vite`,
          definer: "defineViteConfig",
          ...(tested && {
            options: "{\n  test: createVitestLayer(),\n}",
            imports: [
              {
                name: "createVitestLayer",
                entry: `${engrenage}/vitest`,
              },
            ],
          }),
        }),
      );
    },
  };
}
