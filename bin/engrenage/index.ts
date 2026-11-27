import { command } from "#nexus/cli/index";

import scripts from "#bin/engrenage/scripts";
import packageJson from "#package.json" with { type: "json" };

export default command({
  name: "engrenage",
  description: packageJson.description,
  version: packageJson.version,
  subcommands: [
    () => {
      return import("#bin/engrenage/builtins");
    },
    scripts,
  ],
});
