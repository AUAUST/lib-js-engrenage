import { command } from "#nexus/cli/index";

import add from "#bin/metalbrain/agents/skills/add";

export default command({
  name: "skills",
  description: "Select and install shared agent skills.",
  subcommands: [add],
  action() {
    return import("#bin/metalbrain/agents/skills/actions/add");
  },
});
