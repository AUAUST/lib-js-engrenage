import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Print a backlog entry as YAML, with its category, found through `.ai/backlog/index.yml`.",
      )
      .argument("<id>", "the entry's ID, as `YYMMDD-xxxx`");
  },
  action() {
    return import("#bin/metalbrain/backlog/actions/show");
  },
});
