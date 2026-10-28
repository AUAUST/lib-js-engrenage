import { claude } from "#bin/engrenage/agents/claude/index";
import { codex } from "#bin/engrenage/agents/codex/index";
import { defineCommand } from "#support/commander/utils/defineCommand";
import { registerSubcommands } from "#support/commander/utils/registerSubcommands";

export const agents = defineCommand((command) => {
  return registerSubcommands(
    command.description("Integrate project tools with coding agents."),
    {
      claude,
      codex,
    },
  );
});
