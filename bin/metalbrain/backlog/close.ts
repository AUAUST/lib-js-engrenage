import { collectListArgument, defineLazyCommand } from "#nexus/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Remove backlog entries, none when an ID is unknown; deletes a category left empty.",
      )
      .argument(
        "<ids...>",
        "the entries' IDs, comma- or space-separated",
        collectListArgument,
      );
  },
  action() {
    return import("#bin/metalbrain/actions/close");
  },
  parse(ids) {
    return [ids, "backlog"];
  },
});
