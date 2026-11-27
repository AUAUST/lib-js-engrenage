import { argument, command, CommandUsageError, option } from "#nexus/cli/index";

function parsePlanDepth(value: string) {
  if (value === "all") {
    return Number.POSITIVE_INFINITY;
  }

  const depth = Number(value);

  if (!Number.isInteger(depth) || depth < 0) {
    throw new CommandUsageError("Expected a non-negative integer or `all`.");
  }

  return depth;
}

export default command({
  name: "walk",
  description: "Check a walked issue tree.",
  subcommands: [
    command({
      name: "check",
      description: "Report every issue of the tree from an issue down, each parent above its sub-issues, after one line per checkout read, with its state counting the unpushed `Closes` commits of its repository's checkout, Blockers, findings, open **Planning** and **Questions**, local commits and, for each open task or problem, the Model sections its header line and **Provides** name, then each open **Planning** due, every issue ordered before it closed, then the ready set, every issue actionable in turn, and the next one, or that the walk finished, the named issue closed; exit 1 when the walk is stuck, the ready set empty with the named issue open.",
      arguments: [
        argument({
          name: "number",
          description: "issue number",
          parse: Number,
        }),
      ],
      options: [
        option({
          name: "depth",
          type: "string",
          placeholder: "depth",
          description: "levels of plans walked, the named issue's included: 0 or 1 holds every nested plan out of the ready set, 2 walks its direct child plans, `all` every plan below it",
          default: 1,
          parse: parsePlanDepth,
        }),
        option({
          name: "repo",
          type: "string",
          placeholder: "repo",
          description: "repository as `owner/repo` or a registered short name, else package.json or origin",
        }),
        option({
          name: "checkout",
          type: "string",
          placeholder: "checkout",
          description: "checkout whose commits up to `<ref>`, `HEAD` by default, count for its repository's issues, as `<registered short name>=<directory>[@<ref>]`; the current directory counts for its own repository unless a checkout names it; end with `@HEAD` when the directory holds an `@`",
          default: [],
          multiple: true,
        }),
      ],
      action() {
        return import("#bin/metalbrain/planning/walk/actions/check");
      },
    }),
  ],
});
