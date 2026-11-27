import { command } from "#nexus/cli/index";

import claude from "#bin/metalbrain/hook/claude/index";

export default command({
  name: "hook",
  description: "Run the metalbrain agent hooks, reading each runtime's hook payload from stdin.",
  scenario: "json",
  chainable: false,
  subcommands: [claude],
});
