import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command.description(
      "Set the shell options of the session's Bash commands, through the environment script Claude names to SessionStart hooks.",
    );
  },
  action() {
    return import("#bin/engrenage-hook/claude/actions/sessionStart");
  },
});
