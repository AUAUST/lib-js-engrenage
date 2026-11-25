import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Rank the entries of the record kind whose group runs it, or, run at the top level, of every searchable kind together, each line prefixed with its kind, against a query in GitHub code search syntax, one line each as its kind's `list` prints it, weighing each field as its kind declares; when no entry matches every term of an implicit-`AND` query, rank those matching any term, saying so on the first line.",
      )
      .argument(
        "[query...]",
        'the query, its arguments joined by spaces: words, `"phrases"`, `AND`, `OR`, `NOT`, `( … )`, `field:value`, `-field:value` and `/regex/`',
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
