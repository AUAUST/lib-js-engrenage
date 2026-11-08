import { defineGroup } from "#workflows/cli/index";
import { registerLazySubcommands } from "#workflows/cli/operations/registerLazySubcommands";

// @debt registers its subcommands through `registerLazySubcommands` in `configure` instead of naming them in `commands`, until its subcommands become definitions (#328)
export default defineGroup({
  configure(command) {
    return registerLazySubcommands(
      command.description("Manage the pnpm version of the project."),
      {
        upgrade: {
          description:
            "Move the project to the latest pnpm within engrenage's pnpm range.",
          async load() {
            const { upgrade } = await import("#bin/engrenage/pnpm/upgrade");

            return upgrade;
          },
        },
      },
    );
  },
  commands: {},
});
