import { map } from "@auaust/primitive-kit/arrays";

import { gateCommand } from "#tools/lefthook/constants";

export function renderGateCommand(variables: readonly string[]) {
  return {
    only: [
      {
        run: map(variables, (variable) => `test -n "$${variable}"`).join(
          " || ",
        ),
      },
    ],
    run: gateCommand,
  };
}
