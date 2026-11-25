import { defineChainedCommand } from "#workflows/cli/index";

export default defineChainedCommand({
  configure(command) {
    return command
      .description(
        "Rank entries against a query; at the top level, across every record kind.",
      )
      .argument(
        "[query...]",
        "the query in GitHub code search syntax, its arguments joined by spaces; `field:value` filters by an entry field",
      );
  },
  extend() {
    return import("#bin/metalbrain/actions/searchOptions");
  },
  action() {
    return import("#bin/metalbrain/actions/search");
  },
  parse(words, _options, command) {
    const group = command.parent;

    return [
      words,
      command.opts(),
      group?.parent == null ? undefined : group.name(),
    ];
  },
});
