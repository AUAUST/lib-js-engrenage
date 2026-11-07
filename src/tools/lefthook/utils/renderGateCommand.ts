import { map } from "@auaust/primitive-kit/arrays";

import {
  gateCommand,
  gateCommandName,
  localCommandName,
  localGateCommand,
} from "#tools/lefthook/constants";

export function renderGateCommand(
  variables: readonly string[],
  local: boolean,
) {
  const condition = {
    run: map(variables, (variable) => `test -n "$${variable}"`).join(" || "),
  };

  return {
    ...(variables.length === 0
      ? {}
      : {
          [gateCommandName]: { only: [condition], run: gateCommand },
        }),
    ...(local
      ? {
          [localCommandName]: {
            ...(variables.length === 0 ? {} : { skip: [condition] }),
            run: localGateCommand,
          },
        }
      : {}),
  };
}
