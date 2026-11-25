import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Remove entries of any record kind, none when an ID is unknown.",
      )
      .argument("<ids...>", "the entries' IDs, of any kinds");
  },
  action() {
    return import("#bin/metalbrain/actions/close");
  },
  parse(ids) {
    return [ids];
  },
});
