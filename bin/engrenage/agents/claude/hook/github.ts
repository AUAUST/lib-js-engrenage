import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command.description(
      "Deny `gh issue create` and a `gh issue edit` body that breaks the issue contract, and warn or deny when a `gh issue edit|comment` body is over budget, reading Claude's PreToolUse payload from stdin.",
    );
  },
  action() {
    return import("#bin/engrenage/agents/claude/hook/actions/github");
  },
});
