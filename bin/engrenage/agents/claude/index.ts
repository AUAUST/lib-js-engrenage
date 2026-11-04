import { hook } from "#bin/engrenage/agents/claude/hook/index";
import { defineCommand } from "#workflows/cli/operations/defineCommand";
import { registerSubcommands } from "#workflows/cli/operations/registerSubcommands";

export const claude = defineCommand((command) => {
  return registerSubcommands(
    command.description("Integrate the project tools with Claude Code."),
    {
      hook,
    },
  );
});
