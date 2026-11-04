import { picklist } from "valibot";

import { declare } from "#foundation/options/index";

export function declareProgramLayout() {
  return declare(picklist(["commands", "domains"]), {
    description: [
      "How the directories of the environment are classified.",
      "`commands` makes the environment root and every directory that is not a role a command group: its `index.ts` declares the command and each other module is one subcommand named after its file; `domains` classifies them as domains.",
    ],
    optional: { value: "commands" },
  });
}
