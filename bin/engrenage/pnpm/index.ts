import { defineCommand } from "#workflows/cli/operations/defineCommand";
import { registerLazySubcommands } from "#workflows/cli/operations/registerLazySubcommands";

export const pnpm = defineCommand((command) => {
  return registerLazySubcommands(command, {
    upgrade: {
      description:
        "Move the project to the latest pnpm within engrenage's pnpm range.",
      async load() {
        const { upgrade } = await import("#bin/engrenage/pnpm/upgrade");

        return upgrade;
      },
    },
  });
});
