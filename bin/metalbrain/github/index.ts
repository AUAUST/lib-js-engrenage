import { command } from "#nexus/cli/index";

import labels from "#bin/metalbrain/github/labels/index";

export default command({
  name: "github",
  description: "Snapshot GitHub metadata and sync the current repository's labels.",
  subcommands: [
    command({
      name: "fetch",
      description: "Write the labels of every registered repository and the issue types and fields of their organizations to the committed GitHub snapshot.",
      action() {
        return import("#bin/metalbrain/github/actions/fetch");
      },
    }),
    labels,
  ],
});
