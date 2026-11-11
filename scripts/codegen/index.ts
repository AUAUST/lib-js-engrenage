import { defineCommand, defineGroup } from "#workflows/cli/index";

import apis from "#scripts/codegen/apis";
import config from "#scripts/codegen/config";
import editions from "#scripts/codegen/editions";
import rules from "#scripts/codegen/rules";
import schemas from "#scripts/codegen/schemas";

export default defineGroup({
  configure(command) {
    return command
      .description(
        "Generate sources of the package from its tooling, running every generator without a subcommand.",
      )
      .enablePositionalOptions();
  },
  commands: {
    editions,
    apis,
    config,
    rules,
    schemas,
  },
  command: defineCommand({
    configure(command) {
      return command.option(
        "--check",
        "report outdated files without writing them",
        false,
      );
    },
    async action({ check }, command) {
      for (const subcommand of command.commands) {
        await subcommand.parseAsync(check ? ["--check"] : [], {
          from: "user",
        });
      }
    },
  }),
});
