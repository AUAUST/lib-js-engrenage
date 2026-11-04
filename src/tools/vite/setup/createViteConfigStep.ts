// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import { createConfigModule } from "#workflows/cli/utils/createConfigModule";
// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import { engrenage, vite, vitest } from "#constants";
import { hasConfigFile } from "#workflows/cli/operations/hasConfigFile";
// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import type { Step } from "#workflows/cli/types/Step";

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
