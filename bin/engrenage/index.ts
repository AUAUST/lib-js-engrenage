import { command } from "#nexus/cli/index";

import extensions from "#bin/engrenage/extensions";
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
    extensions,
    scripts,
  ],
});
