import {
  gateCommand,
  gateCommandName,
  localCommandName,
  localGateCommand,
} from "#tools/lefthook/constants";
import { renderGateCondition } from "#tools/lefthook/utils/renderGateCondition";

export function renderGateCommand(
  variables: readonly string[],
  local: boolean,
) {
  const condition = renderGateCondition(variables);

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
