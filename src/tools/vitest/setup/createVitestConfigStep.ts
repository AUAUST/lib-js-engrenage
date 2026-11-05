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
