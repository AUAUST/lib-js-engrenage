import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description("Install a shared agent rule by name.")
      .argument("<name>", "rule name, for example code-style");
  },
  action() {
    return import("#bin/engrenage/agents/rules/actions/add");
  },
});
