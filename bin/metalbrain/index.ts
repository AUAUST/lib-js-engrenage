import { command } from "#nexus/cli/index";

import hook from "#bin/metalbrain/hook/index";

export default command({
  name: "metalbrain",
  description: "Run agent tooling: dispatch, planning, GitHub metadata, records and hooks.",
  subcommands: [
    hook,
    () => {
      return import("#bin/metalbrain/builtins");
    },
  ],
});
