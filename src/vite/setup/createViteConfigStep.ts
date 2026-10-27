import { engrenage, vite, vitest } from "#constants";
import { createConfigModule } from "#support/scaffold/utils/createConfigModule";
import { hasConfigFile } from "#support/scaffold/utils/hasConfigFile";
import type { Step } from "#support/scaffold/types/Step";

export function createViteConfigStep(): Step {
  const file = `${vite}.config.ts`;

  return {
    name: file,
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
