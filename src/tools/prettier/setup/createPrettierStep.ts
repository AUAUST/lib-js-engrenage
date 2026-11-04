import { engrenage, prettier } from "#constants";
// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import type { Step } from "#workflows/cli/types/Step";

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
