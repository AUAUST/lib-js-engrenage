import { defineLegacyCommand } from "#workflows/cli/operations/defineLegacyCommand";
import { registerLazySubcommands } from "#workflows/cli/operations/registerLazySubcommands";

export const claude = defineLegacyCommand((command) => {
  return registerLazySubcommands(command, {
    hook: {
      description: "Run the Claude Code hooks of the project.",
      async load() {
        const { hook } =
          await import("#bin/engrenage/agents/claude/hook/index");

        return hook;
      },
    },
  });
});
