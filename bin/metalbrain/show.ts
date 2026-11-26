import { collectListArgument, defineLazyCommand } from "#nexus/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description("Print entries of any record kind in full.")
      .argument(
        "<ids...>",
        "the entries' IDs of any kinds, comma- or space-separated",
        collectListArgument,
      );
  },
  action() {
    return import("#bin/metalbrain/actions/show");
  },
  parse(ids) {
    return [ids];
  },
});
