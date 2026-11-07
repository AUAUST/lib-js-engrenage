import { jscpd } from "#constants";
import type { Step } from "#project/steps/index";

export function createJscpdStep(): Step {
  return {
    name: jscpd,
    message: "Warn about duplicated code in the commit gate with jscpd?",
    async isMissing({ hasDependency }) {
      return !(await hasDependency(jscpd));
    },
    async plan({ addDevDependency }) {
      await addDevDependency(jscpd);
    },
  };
}
