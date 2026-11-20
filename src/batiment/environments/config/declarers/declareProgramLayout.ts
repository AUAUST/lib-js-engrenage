import { picklist } from "valibot";

import { declare } from "#foundation/options/index";

export function declareProgramLayout() {
  return declare(picklist(["commands", "domains"]), {
    description: [
      "How the directories of the environment are classified.",
      "`commands` makes the environment root and every directory that is not a role a command group: its `index.ts` names its subcommands and their aliases, the root group's `executable.ts` runs it, and each other module is one command; `domains` classifies them as domains.",
    ],
    optional: {
      value: "commands",
    },
  });
}
