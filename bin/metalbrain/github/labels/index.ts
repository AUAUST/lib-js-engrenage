import { command } from "#nexus/cli/index";

import prune from "#bin/metalbrain/github/labels/prune";
import sync from "#bin/metalbrain/github/labels/sync";

export default command({
  name: "labels",
  description: "Sync the current repository's labels with the config.",
  subcommands: [sync, prune],
});
