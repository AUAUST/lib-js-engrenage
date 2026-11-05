import { engrenage, prettier } from "#constants";
import { hasConfigFile, type Step } from "#project/steps/index";

export function createPrettierStep(): Step {
  return {
    name: `${prettier}.config.ts`,
    message: "Format with Prettier?",
    isMissing({ filesystem, readPackageJson }) {
      return (
        readPackageJson([prettier]) === undefined &&
        !hasConfigFile(filesystem, prettier)
      );
    },
    plan({ writePackageJson, addDevDependency }) {
      writePackageJson([prettier], `${engrenage}/prettier`);
      addDevDependency(prettier);
    },
  };
}
