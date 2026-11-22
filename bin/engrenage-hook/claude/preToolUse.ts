import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command.description(
      "Route Claude's PreToolUse payload from stdin to the checks its tool call needs: git gate bypasses, zsh and macOS shell traps, `gh issue` writes, dispatch readiness and resume ceilings.",
    );
  },
  action() {
    return import("#bin/engrenage-hook/claude/actions/preToolUse");
  },
});
