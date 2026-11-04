import { edit } from "#bin/engrenage/agents/codex/hook/edit";
import { defineCommand } from "#cli/operations/defineCommand";
import { registerSubcommands } from "#cli/operations/registerSubcommands";

export const hook = defineCommand((command) => {
  return registerSubcommands(
    command.description("Run the Claude Code hooks of the project."),
    {
      edit,
    },
  );
});
