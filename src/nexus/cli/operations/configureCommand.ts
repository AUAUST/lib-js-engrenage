import type { Command, CommandUnknownOpts } from "@commander-js/extra-typings";

// @debt Commander exposes no getter for a command's action handler, so mounting wraps the instance's `action` during `configure` to detect a call instead of reading whether an action is set
export function configureCommand(
  command: Command,
  configure: (command: Command) => CommandUnknownOpts,
): CommandUnknownOpts {
  const action = command.action.bind(command);

  let actionSet = false;

  command.action = (handler) => {
    actionSet = true;

    return action(handler);
  };

  let configured: CommandUnknownOpts;

  try {
    configured = configure(command);
  } finally {
    Reflect.deleteProperty(command, "action");
  }

  if (actionSet) {
    throw new TypeError(
      `The configure of the ${command.name()} command calls .action; its definition's action runs the command`,
    );
  }

  if (configured !== command) {
    throw new TypeError(
      `The configure of the ${command.name()} command must configure the command it receives instead of returning another one`,
    );
  }

  return configured;
}
