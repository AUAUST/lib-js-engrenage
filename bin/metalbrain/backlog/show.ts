import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Print backlog entries as YAML, each with its category, found through `.ai/backlog/index.yml`, in argument order; takes several IDs, printing nothing and naming every unknown ID when one is unknown.",
      )
      .argument("<ids...>", "the entries' IDs, as `BL-xxxxxx`");
  },
  action() {
    return import("#bin/metalbrain/actions/show");
  },
  parse(ids) {
    return [ids, "backlog"];
  },
});
