import { command } from "#nexus/cli/index";

import fetch from "#bin/metalbrain/github/fetch";
import labels from "#bin/metalbrain/github/labels/index";

export default command({
  name: "github",
  description: "Snapshot GitHub metadata and sync the current repository's labels.",
  subcommands: [fetch, labels],
});
