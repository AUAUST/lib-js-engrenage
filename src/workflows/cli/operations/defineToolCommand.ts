import type { Command } from "@commander-js/extra-typings";

import { loadLazy, type Loadable } from "#foundation/modules/index";
import {
  defineForwardingCommand,
  type CommandDefinition,
} from "#nexus/cli/index";
import type { KnownPackageName } from "#types/KnownPackageName";
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
  return defineForwardingCommand({
    ...(configure === undefined ? {} : { configure }),
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
  });
}
