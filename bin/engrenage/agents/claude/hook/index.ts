import { edit } from "#bin/engrenage/agents/claude/hook/edit";
import { github } from "#bin/engrenage/agents/claude/hook/github";
import { defineCommand } from "#workflows/cli/operations/defineCommand";
import { registerSubcommands } from "#workflows/cli/operations/registerSubcommands";

export const hook = defineCommand((command) => {
  return registerSubcommands(
    command.description("Run the Claude Code hooks of the project."),
    {
      edit,
      github,
    },
  );
});
