import { command } from "#nexus/cli/index";

import check from "#bin/metalbrain/planning/walk/check";

export default command({
  name: "walk",
  description: "Check a walked issue tree.",
  subcommands: [check],
});
