import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description("Print entries in full.")
      .argument("<ids...>", "the entries' IDs");
  },
  action() {
    return import("#bin/metalbrain/actions/show");
  },
  parse(ids, _options, command) {
    return [ids, command.parent?.name() ?? ""];
  },
});
