import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command.description(
      "Route Codex's PreToolUse payload from stdin to the checks its tool call needs: dispatch readiness and `gh issue` writes.",
    );
  },
  action() {
    return import("#bin/engrenage-hook/codex/actions/preToolUse");
  },
});
