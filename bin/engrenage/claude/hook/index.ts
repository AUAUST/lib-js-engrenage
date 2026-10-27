import { edit } from "#bin/engrenage/claude/hook/edit";
import { defineCommand } from "#support/commander/utils/defineCommand";
import { registerSubcommands } from "#support/commander/utils/registerSubcommands";

export const hook = defineCommand((command) => {
  return registerSubcommands(
    command.description("Run the Claude Code hooks of the project."),
    {
      edit,
    },
  );
});
