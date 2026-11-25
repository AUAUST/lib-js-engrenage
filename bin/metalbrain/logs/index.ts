import { defineGroup } from "#workflows/cli/index";

import add from "#bin/metalbrain/logs/add";
import close from "#bin/metalbrain/logs/close";
import list from "#bin/metalbrain/logs/list";
import search from "#bin/metalbrain/logs/search";
import show from "#bin/metalbrain/logs/show";
import stats from "#bin/metalbrain/logs/stats";

// @debt each log kind's purpose and file restate its declaration in `metalbrain/logs`, since command definitions load with the hook graph and cannot import it
const purposes: Readonly<Record<string, string>> = {
  friction: "the friction agents meet: each retry, workaround or lookup anything but their own changes cost them, in .ai/friction.yml",
  discarded: "the solutions agents set aside because their cost exceeded what the task or role allows, in .ai/discarded.yml",
  pending: "the follow-up work agents leave outside a pass, in .ai/pending.yml",
  missing: "the capabilities agents built or worked around because the codebase or a dependency lacked them, in .ai/missing.yml",
};

export default defineGroup({
  configure(command) {
    return command
      .description(
        `Add, find, close and count ${purposes[command.name()] ?? `the ${command.name()} entries`}; every write checks the entry against the ${command.name()} file schema.`,
      )
      .addHelpText(
        "afterAll",
        "\nPass text arguments in single quotes, writing '\\'' for a single quote inside: within double quotes, the shell runs backticks and `$(…)` and expands variables before metalbrain reads them.",
      );
  },
  commands: {
    add,
    list,
    search,
    show,
    close,
    stats,
  },
});
