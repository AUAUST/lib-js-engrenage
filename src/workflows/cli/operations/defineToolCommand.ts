import { loadLazy, type Loadable } from "#foundation/modules/index";
import {
  forwardingCommand,
  type ForwardingCommandDeclaration,
} from "#nexus/cli/index";
import type { KnownPackageName } from "#types/KnownPackageName";
import type { ToolAction } from "#workflows/cli/types/ToolAction";

export function defineToolCommand({
  name,
  aliases = [],
  description,
  packageName,
  binary = packageName,
  message,
  root = false,
  action,
}: {
  name: string;
  aliases?: readonly string[];
  description?: string;
  packageName: KnownPackageName;
  binary?: string;
  message?: string;
  root?: boolean;
  action?(): Promise<Loadable<ToolAction>>;
}): ForwardingCommandDeclaration {
  return forwardingCommand({
    name,
    aliases,
    ...(description !== undefined && { description }),
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
