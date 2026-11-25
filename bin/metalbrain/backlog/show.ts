import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Print backlog entries as a thin tree of categories under `backlog`, found through `.ai/backlog/index.yml`, each headed by its ID and title with its other fields under it, in argument order within its category; takes several IDs, printing nothing and naming every unknown ID when one is unknown.",
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
