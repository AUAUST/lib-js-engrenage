import { command } from "#nexus/cli/index";

import add from "#bin/metalbrain/agents/rules/add";

export default command({
  name: "rules",
  description: "Select and install shared agent rules.",
  subcommands: [add],
  action() {
    return import("#bin/metalbrain/agents/rules/actions/add");
  },
});
