import type { Command } from "@commander-js/extra-typings";

import { loadLazy, type Loadable } from "#foundation/modules/index";
import { defineLazyCommand } from "#workflows/cli/operations/defineLazyCommand";
import { forwardingCommands } from "#workflows/cli/operations/forwardingCommands";
import type { KnownPackageName } from "#types/KnownPackageName";
import type { CommandDefinition } from "#workflows/cli/types/CommandDefinition";
import type { ToolAction } from "#workflows/cli/types/ToolAction";

export function defineToolCommand({
  packageName,
  binary = packageName,
  message,
  root = false,
  configure,
  action,
}: {
  packageName: KnownPackageName;
  binary?: string;
  message?: string;
  root?: boolean;
  configure?(command: Command): Command;
  action?(): Promise<Loadable<ToolAction>>;
}): CommandDefinition {
  return defineLazyCommand({
    configure(command) {
      forwardingCommands.add(command);

      const passing = command
        .helpOption(false)
        .passThroughOptions()
        .allowUnknownOption()
        .allowExcessArguments();

      return configure === undefined ? passing : configure(passing);
    },
    async action() {
      const [loaded, { runTool }] = await Promise.all([
        action === undefined ? undefined : loadLazy({ load: action }),
        import("#workflows/cli/operations/runTool"),
      ]);

      return async (args: string[]) => {
        await runTool(
          {
            packageName,
            binary,
            message,
            root,
            action: loaded,
          },
          args,
        );
      };
    },
    parse(_options, command) {
      return [[...command.args]];
    },
  });
}
