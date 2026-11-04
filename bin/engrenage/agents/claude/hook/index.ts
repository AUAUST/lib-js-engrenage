import { edit } from "#bin/engrenage/agents/claude/hook/edit";
import { defineCommand } from "#cli/utils/defineCommand";
import { registerSubcommands } from "#cli/utils/registerSubcommands";

export const hook = defineCommand((command) => {
  return registerSubcommands(
    command.description("Run the Claude Code hooks of the project."),
    {
      edit,
    },
  );
});
