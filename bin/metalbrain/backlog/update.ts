import {
  collectArgument,
  collectListArgument,
  defineLazyCommand,
} from "#workflows/cli/index";

// @debt the help states the item limit `backlog.detailLimit` holds, since command definitions load with the hook graph and cannot import it
export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Replace or remove fields of a backlog entry, keeping its ID and other fields; writes nothing when the entry would break the backlog file schema: at most 3 items across --why, --want and --done, each site naming an existing file, within the backlog entry word cap.",
      )
      .argument("<id>", "the entry's ID, as `YYMMDD-xxxx`")
      .option(
        "--title <title>",
        "the claim: the problem or need, stated exactly",
      )
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
        "--unset <field>",
        "remove a field: `sites`, `why`, `want` or `done`; comma-separated or repeated",
        collectListArgument,
        [],
      );
  },
  action() {
    return import("#bin/metalbrain/backlog/actions/update");
  },
});
