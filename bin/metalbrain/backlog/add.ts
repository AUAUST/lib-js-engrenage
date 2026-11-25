import {
  collectArgument,
  collectListArgument,
  defineChainedCommand,
} from "#workflows/cli/index";

// @debt the help states the item limit `backlog.detailLimit` holds, since command definitions load with the hook graph and cannot import it
export default defineChainedCommand({
  configure(command) {
    return command
      .description(
        "Append an entry to `.ai/backlog/<category>.yml` with a new ID, `BL-xxxxxx`, and print the ID; writes nothing when the entry would break the backlog file schema: at most 3 items across --why, --want and --done, each site naming an existing file, within the backlog entry word cap.",
      )
      .argument("<category>", "an existing category's name")
      .argument("<title>", "the claim: the problem or need, stated exactly")
      .option(
        "--sites <sites>",
        "code sites as `<path>:<line>`, comma-separated or repeated",
        collectListArgument,
      )
      .option("--why <text>", "context; repeat for a list", collectArgument)
      .option(
        "--want <text>",
        "expected outcome; repeat for a list",
        collectArgument,
      )
      .option(
        "--done <text>",
        "completion or obsolescence condition; repeat for a list",
        collectArgument,
      )
      .option(
        "--keywords <keywords>",
        "terms widening the similar-entry search, never written to the entry; comma-separated or repeated",
        collectListArgument,
      );
  },
  action() {
    return import("#bin/metalbrain/backlog/actions/add");
  },
  parse(category, title, options) {
    return [category, title, options];
  },
});
