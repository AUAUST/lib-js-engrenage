import { messageGateCommand } from "#tools/lefthook/constants";
import { renderGateCondition } from "#tools/lefthook/utils/renderGateCondition";

export function renderMessageGateCommand(variables: readonly string[]) {
  return variables.length === 0
    ? undefined
    : {
        only: [renderGateCondition(variables)],
        run: messageGateCommand,
      };
}
