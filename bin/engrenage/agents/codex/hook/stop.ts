import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command.description(
      "Return verification failures to a stopped Codex worker or debugger.",
    );
  },
  action() {
    return import("#bin/engrenage/agents/codex/hook/actions/stop");
  },
});
