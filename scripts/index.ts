import { engrenage } from "#constants";
import { command } from "#nexus/cli/index";

import codegen from "#scripts/codegen/index";
import pnpm from "#scripts/pnpm";

export default command({
  name: "support",
  description: `Maintain generated sources of ${engrenage} itself.`,
  subcommands: [codegen, pnpm],
});
