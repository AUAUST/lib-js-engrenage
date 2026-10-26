import { engrenage, prettier } from "#constants";
import type { Step } from "#support/scaffold/types/Step";

export function createPrettierStep(): Step {
  return {
    name: `${prettier} in package.json`,
    message: "Format with Prettier?",
    isMissing({ readPackageJson }) {
      return readPackageJson([prettier]) === undefined;
    },
    plan({ writePackageJson, addDevDependency }) {
      writePackageJson([prettier], `${engrenage}/prettier`);

      addDevDependency(prettier);
    },
  };
}
