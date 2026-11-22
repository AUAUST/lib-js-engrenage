import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description("Install a shared agent skill by name.")
      .argument("<name>", "skill name, for example planning");
  },
  action() {
    return import("#bin/metalbrain/agents/skills/actions/add");
  },
});
