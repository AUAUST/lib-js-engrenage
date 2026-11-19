import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command.description(
      "Return verification failures to a stopped Codex worker or debugger, reading Codex's SubagentStop payload from stdin.",
    );
  },
  action() {
    return import("#bin/engrenage-hook/codex/actions/subagentStop");
  },
});
