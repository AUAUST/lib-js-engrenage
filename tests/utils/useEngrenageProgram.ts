import { program } from "#nexus/cli/index";
import { runProgram } from "#nexus/cli/operations/runProgram";
import { useFailingProgram } from "#tests/utils/useFailingProgram";

import engrenage from "#bin/engrenage/index";

export function useEngrenageProgram() {
  const { getReporter, printed } = useFailingProgram();

  function run(...args: string[]) {
    return runProgram(
      program({ root: engrenage, scenarios: getReporter().scenarios }),
      ["node", "engrenage", ...args],
    );
  }

  return { run, printed };
}
