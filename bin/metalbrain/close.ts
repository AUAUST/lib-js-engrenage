import { collectListArgument, defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Remove entries of any record kind, none when an ID is unknown.",
      )
      .argument(
        "<ids...>",
        "the entries' IDs of any kinds, comma- or space-separated",
        collectListArgument,
      );
  },
  action() {
    return import("#bin/metalbrain/actions/close");
  },
  parse(ids) {
    return [ids];
  },
});
