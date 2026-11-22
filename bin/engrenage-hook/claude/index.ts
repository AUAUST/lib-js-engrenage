import { defineGroup } from "#workflows/cli/index";

export default defineGroup({
  configure(command) {
    return command.description("Run the Claude Code hooks of the project.");
  },
  commands: {},
});
