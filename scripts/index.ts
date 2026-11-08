import { engrenage } from "#constants";
import { defineGroup } from "#workflows/cli/index";

import codegen from "#scripts/codegen/index";
import pnpm from "#scripts/pnpm";

export default defineGroup({
  configure(command) {
    return command.description(
      `Maintain generated sources of ${engrenage} itself.`,
    );
  },
  commands: {
    codegen,
    pnpm,
  },
});
