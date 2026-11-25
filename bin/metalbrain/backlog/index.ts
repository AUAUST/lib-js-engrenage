import { defineGroup } from "#workflows/cli/index";

import add from "#bin/metalbrain/backlog/add";
import categories from "#bin/metalbrain/backlog/categories";
import close from "#bin/metalbrain/backlog/close";
import create from "#bin/metalbrain/backlog/create";
import list from "#bin/metalbrain/backlog/list";
import move from "#bin/metalbrain/backlog/move";
import relocate from "#bin/metalbrain/backlog/relocate";
import search from "#bin/metalbrain/backlog/search";
import show from "#bin/metalbrain/backlog/show";
import update from "#bin/metalbrain/backlog/update";

// @debt the single-quote help note restates the one in `bin/metalbrain/logs/index.ts`, since bin modules are commands and share no constants
export default defineGroup({
  configure(command) {
    return command
      .description(
        "Create, find, update, move and close the backlog's categories and entries in .ai/backlog/, and relocate their sites, checked against the backlog file schema; every write regenerates .ai/backlog/index.yml.",
      )
      .addHelpText(
        "afterAll",
        "\nPass text arguments in single quotes, writing '\\'' for a single quote inside: within double quotes, the shell runs backticks and `$(…)` and expands variables before metalbrain reads them.",
      );
  },
  commands: {
    categories,
    list,
    search,
    show,
    create,
    add,
    update,
    move,
    relocate,
    close,
  },
});
