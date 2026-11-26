import { defineLazyCommand } from "#nexus/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command.description(
      "Check local agent integration without changing settings.",
    );
  },
  action() {
    return import("#bin/metalbrain/agents/actions/check");
  },
});
