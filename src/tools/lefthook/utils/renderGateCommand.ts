import {
  everyoneCommandName,
  everyoneGateCommand,
  gateCommand,
  gateCommandName,
} from "#tools/lefthook/constants";
import { renderGateCondition } from "#tools/lefthook/utils/renderGateCondition";

export function renderGateCommand(variables: readonly string[]) {
  const condition = renderGateCondition(variables);

  return {
    ...(variables.length === 0
      ? {}
      : {
          [gateCommandName]: { only: [condition], run: gateCommand },
        }),
    [everyoneCommandName]: {
      ...(variables.length === 0 ? {} : { skip: [condition] }),
      run: everyoneGateCommand,
    },
  };
}
