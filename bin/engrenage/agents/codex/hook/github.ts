import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command.description(
      "Deny a `gh issue create|edit` body that breaks the issue contract, and warn or deny when a `gh issue create|edit|comment` body is over budget, reading Codex's PreToolUse payload from stdin.",
    );
  },
  action() {
    return import("#bin/engrenage/agents/codex/hook/actions/github");
  },
});
