import { command } from "#nexus/cli/index";

import issue from "#bin/metalbrain/planning/issue/index";
import walk from "#bin/metalbrain/planning/walk/index";

export default command({
  name: "planning",
  description: "Draft, publish and walk planned GitHub issues.",
  subcommands: [issue, walk],
});
