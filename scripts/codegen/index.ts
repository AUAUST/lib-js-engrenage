import { command, option } from "#nexus/cli/index";

import apis from "#scripts/codegen/apis";
import config from "#scripts/codegen/config";
import editions from "#scripts/codegen/editions";
import rules from "#scripts/codegen/rules";
import schemas from "#scripts/codegen/schemas";

export default command({
  name: "codegen",
  description: "Generate sources of the package from its tooling, running every generator without a subcommand.",
  options: [
    option({
      name: "check",
      type: "boolean",
      description: "report outdated files without writing them",
      default: false,
    }),
  ],
  subcommands: [editions, apis, config, rules, schemas],
  action() {
    return import("#scripts/codegen/actions/all");
  },
});
