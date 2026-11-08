import { defineLegacyCommand } from "#workflows/cli/operations/defineLegacyCommand";
import { registerLazySubcommands } from "#workflows/cli/operations/registerLazySubcommands";

export const codex = defineLegacyCommand((command) => {
  return registerLazySubcommands(command, {
    hook: {
      description: "Run the Codex hooks of the project.",
      async load() {
        const { hook } = await import("#bin/engrenage/agents/codex/hook/index");

        return hook;
      },
    },
  });
});
