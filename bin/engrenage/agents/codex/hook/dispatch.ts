import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command.description(
      "Check Codex worker and debugger dispatch readiness.",
    );
  },
  action() {
    return import("#bin/engrenage/agents/codex/hook/actions/dispatch");
  },
});
