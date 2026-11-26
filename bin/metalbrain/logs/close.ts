import { collectListArgument, defineLazyCommand } from "#nexus/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description("Remove entries, none when an ID is unknown.")
      .argument(
        "<ids...>",
        "the entries' IDs, comma- or space-separated",
        collectListArgument,
      );
  },
  action() {
    return import("#bin/metalbrain/actions/close");
  },
  parse(ids, _options, command) {
    return [ids, command.parent?.name() ?? ""];
  },
});
