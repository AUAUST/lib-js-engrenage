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
    async plan({ confirm, filesystem, writePackageJson, addDevDependency }) {
      if (
        await confirm(
          "Does Prettier need custom rules (plugins, overrides)?",
          false,
        )
      ) {
        filesystem.write(
          file,
          createConfigModule({
            entry: `${engrenage}/prettier`,
            definer: "definePrettierConfig",
          }),
        );
      } else {
        writePackageJson([prettier], `${engrenage}/prettier`);
      }

      addDevDependency(prettier);
    },
  };
}
