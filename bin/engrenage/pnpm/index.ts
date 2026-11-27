import { command } from "#nexus/cli/index";

import upgrade from "#bin/engrenage/pnpm/upgrade";

export default command({
  name: "pnpm",
  description: "Manage the pnpm version of the project.",
  subcommands: [upgrade],
});
