import { collectListArgument, defineLazyCommand } from "#nexus/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description("Print backlog entries in full.")
      .argument(
        "<ids...>",
        "the entries' IDs, comma- or space-separated",
        collectListArgument,
      );
  },
  action() {
    return import("#bin/metalbrain/actions/show");
  },
  parse(ids) {
    return [ids, "backlog"];
  },
});
