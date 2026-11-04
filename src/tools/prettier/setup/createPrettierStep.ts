import { engrenage, prettier } from "#constants";
import { createConfigModule } from "#project/steps/utils/createConfigModule";
import { hasConfigFile } from "#project/steps/utils/hasConfigFile";
import type { Step } from "#project/steps/types/Step";

export function createPrettierStep(): Step {
  const file = `${prettier}.config.ts`;

  return {
    name: file,
    message: "Format with Prettier?",
    isMissing({ filesystem, readPackageJson }) {
      return (
        readPackageJson([prettier]) === undefined &&
        !hasConfigFile(filesystem, prettier)
      );
    },
    plan({ filesystem, addDevDependency }) {
      filesystem.write(
        file,
        createConfigModule({
          entry: `${engrenage}/prettier`,
          definer: "definePrettierConfig",
        }),
      );

      addDevDependency(prettier);
    },
  };
}
