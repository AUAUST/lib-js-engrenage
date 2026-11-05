import { engrenage, prettier } from "#constants";
import { hasConfigFile, type Step } from "#project/steps/index";

export function createPrettierStep(): Step {
  return {
    name: `${prettier}.config.ts`,
    message: "Format with Prettier?",
    async isMissing({ filesystem, readPackageJson }) {
      return (
        (await readPackageJson([prettier])) === undefined &&
        !hasConfigFile(filesystem, prettier)
      );
    },
    async plan({ writePackageJson, addDevDependency }) {
      await writePackageJson([prettier], `${engrenage}/prettier`);
      await addDevDependency(prettier);
    },
  };
}
