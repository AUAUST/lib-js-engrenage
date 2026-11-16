import {
  everyoneCommandName,
  gateCommandName,
} from "#tools/lefthook/constants";
import { renderGateCondition } from "#tools/lefthook/utils/renderGateCondition";

export function renderGateCommand(
  variables: readonly string[],
  run: { readonly agents: string; readonly everyone: string },
) {
  const condition = renderGateCondition(variables);

  return {
    ...(variables.length === 0
      ? {}
      : {
          [gateCommandName]: { only: [condition], run: run.agents },
        }),
    [everyoneCommandName]: {
      ...(variables.length === 0 ? {} : { skip: [condition] }),
      run: run.everyone,
    },
  };
}
