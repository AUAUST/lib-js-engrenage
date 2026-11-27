import { command } from "#nexus/cli/index";

import map from "#bin/batiment/map";

export default command({
  name: "batiment",
  description: "Walk the project structure and report how batiment classifies it.",
  subcommands: [map],
});
