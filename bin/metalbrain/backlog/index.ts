import { defineGroup } from "#workflows/cli/index";

import add from "#bin/metalbrain/backlog/add";
import categories from "#bin/metalbrain/backlog/categories";
import close from "#bin/metalbrain/backlog/close";
import create from "#bin/metalbrain/backlog/create";
import list from "#bin/metalbrain/backlog/list";
import move from "#bin/metalbrain/backlog/move";
import search from "#bin/metalbrain/backlog/search";
import show from "#bin/metalbrain/backlog/show";
import update from "#bin/metalbrain/backlog/update";

export default defineGroup({
  configure(command) {
    return command.description(
      "Create, find, update, move and close the backlog's categories and entries in .ai/backlog/, checked against the backlog file schema; every write regenerates .ai/backlog/index.yml.",
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
    close,
  },
});
