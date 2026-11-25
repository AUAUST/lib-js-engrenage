import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Print entries as a thin tree under the log's name, each headed by its ID and subject with its other fields under it, in argument order; takes several IDs, printing nothing and naming every unknown ID when one is unknown.",
      )
      .argument("<ids...>", "the entries' IDs, as `<namespace>-xxxxxx`");
  },
  action() {
    return import("#bin/metalbrain/actions/show");
  },
  parse(ids, _options, command) {
    return [ids, command.parent?.name() ?? ""];
  },
});
