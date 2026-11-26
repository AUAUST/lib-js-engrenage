import { InvalidArgumentError } from "@commander-js/extra-typings";

import { collectArgument, defineLazyCommand } from "#nexus/cli/index";

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
        "Report every issue of the tree from an issue down, each parent above its sub-issues, after one line per checkout read, with its state counting the unpushed `Closes` commits of its repository's checkout, Blockers, findings, open **Planning** and **Questions**, local commits and, for each open task or problem, the Model sections its header line and **Provides** name, then each open **Planning** due, every issue ordered before it closed, then the ready set, every issue actionable in turn, and the next one, or that the walk finished, the named issue closed; exit 1 when the walk is stuck, the ready set empty with the named issue open.",
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
      )
      .option(
        "--checkout <checkout>",
        "checkout whose commits up to `<ref>`, `HEAD` by default, count for its repository's issues, as `<registered short name>=<directory>[@<ref>]`, repeatable; the current directory counts for its own repository unless a checkout names it; end with `@HEAD` when the directory holds an `@`",
        collectArgument,
        [],
      );
  },
  action() {
    return import("#bin/metalbrain/planning/walk/actions/check");
  },
});
