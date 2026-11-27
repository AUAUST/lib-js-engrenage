import { argument, command } from "#nexus/cli/index";

export default command({
  name: "search",
  description: "Rank entries against a query; at the top level, across every record kind.",
  chain: true,
  arguments: [
    argument({
      name: "query",
      description: "the query in GitHub code search syntax, its arguments joined by spaces; `field:value` filters by an entry field",
      optional: true,
      variadic: true,
    }),
  ],
  options: [
    () => {
      return import("#bin/metalbrain/actions/searchOptions");
    },
  ],
  action() {
    return import("#bin/metalbrain/actions/search");
  },
  parse(words, _options, { path, options }) {
    return [words, options, path.at(-2)];
  },
});
