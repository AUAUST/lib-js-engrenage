import { engrenage } from "#constants";
import { command, option } from "#nexus/cli/index";

import codegen from "#scripts/codegen/index";

export default command({
  name: "support",
  description: `Maintain generated sources of ${engrenage} itself.`,
  subcommands: [
    codegen,
    command({
      name: "pnpm",
      description: "Compare the pnpm range of engrenage with the newest pnpm.",
      options: [
        option({
          name: "check",
          type: "boolean",
          description: "fail when pnpm is two or more majors ahead",
          default: false,
        }),
      ],
      action() {
        return import("#scripts/actions/pnpm");
      },
    }),
  ],
});
