import { engrenage, vite, vitest } from "#constants";
import {
  createConfigModule,
  hasConfigFile,
  type Step,
} from "#project/steps/index";

export function createViteConfigStep(): Step {
  const file = `${vite}.config.ts`;

  return {
    name: file,
    message: `Create ${file}?`,
    async isMissing({ filesystem, hasDependency }) {
      return (await hasDependency(vite)) && !hasConfigFile(filesystem, vite);
    },
    async plan({ filesystem, hasDependency }) {
      const tested = await hasDependency(vitest);

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
