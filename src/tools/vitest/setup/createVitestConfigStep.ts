import { engrenage, vite, vitest } from "#constants";
import {
  createConfigModule,
  hasConfigFile,
  type Step,
} from "#project/steps/index";

export function createVitestConfigStep(): Step {
  const file = `${vitest}.config.ts`;

  return {
    name: file,
    message: `Create ${file}?`,
    async isMissing({ filesystem, hasDependency }) {
      return (
        (await hasDependency(vitest)) &&
        !(await hasDependency(vite)) &&
        !(await hasConfigFile(filesystem, vitest))
      );
    },
    async plan({ filesystem }) {
      await filesystem.write(
        file,
        createConfigModule({
          entry: `${engrenage}/vitest`,
          definer: "defineVitestConfig",
        }),
      );
    },
  };
}
