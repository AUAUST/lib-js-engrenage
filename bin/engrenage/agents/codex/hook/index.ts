import { edit } from "#bin/engrenage/agents/codex/hook/edit";
import { github } from "#bin/engrenage/agents/codex/hook/github";
import { defineCommand } from "#workflows/cli/operations/defineCommand";
import { registerSubcommands } from "#workflows/cli/operations/registerSubcommands";

export const hook = defineCommand((command) => {
  return registerSubcommands(
    command.description("Run the Codex hooks of the project."),
    {
      edit,
      github,
    },
  );
});
