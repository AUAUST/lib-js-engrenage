import type { Command } from "@commander-js/extra-typings";

import { defineLazyCommand } from "#workflows/cli/operations/defineLazyCommand";
import { forwardingCommands } from "#workflows/cli/operations/forwardingCommands";
import type { KnownPackageName } from "#types/KnownPackageName";
import type { CommandDefinition } from "#workflows/cli/types/CommandDefinition";

type ToolAction = (
  args: string[],
) => readonly string[] | Promise<readonly string[]>;

export function defineToolCommand({
  packageName,
  binary = packageName,
  message,
  configure,
  action,
}: {
  packageName: KnownPackageName;
  binary?: string;
  message?: string;
  configure?(command: Command): Command;
  action?(): Promise<ToolAction | { default: ToolAction }>;
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
        action?.(),
        import("#workflows/cli/operations/runTool"),
      ]);

      return async (args: string[]) => {
        const resolved =
          loaded === undefined
            ? args
            : await ("default" in loaded ? loaded.default : loaded)(args);

        await runTool(
          {
            packageName,
            binary,
            message,
          },
          resolved,
        );
      };
    },
    parse(_options, command) {
      return [[...command.args]];
    },
  });
}
