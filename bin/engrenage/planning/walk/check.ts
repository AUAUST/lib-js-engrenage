import { InvalidArgumentError } from "commander";

import { defineLazyCommand } from "#workflows/cli/index";

function parsePlanDepth(value: string) {
  if (value === "all") {
    return Number.POSITIVE_INFINITY;
  }

  const depth = Number(value);

  if (!Number.isInteger(depth) || depth < 0) {
    throw new InvalidArgumentError("Expected a non-negative integer or `all`.");
  }

  return depth;
}

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Report every issue of the tree from an issue down, each parent above its sub-issues, with its state counting local `Closes` commits, Blockers, findings, open **Planning** and **Questions** and local commits, then the ready set, every issue actionable in turn, and the next one; exit 1 when the ready set is empty.",
      )
      .argument("<number>", "issue number", Number)
      .option(
        "--depth <depth>",
        "levels of plans walked, the named issue's included: 0 or 1 holds every nested plan out of the ready set, 2 walks its direct child plans, `all` every plan below it",
        parsePlanDepth,
        1,
      )
      .option(
        "--repo <repo>",
        "repository as `owner/repo` or a registered short name, else package.json or origin",
      );
  },
  action() {
    return import("#bin/engrenage/planning/walk/actions/check");
  },
});
