import { command } from "#nexus/cli/index";

import add from "#bin/metalbrain/backlog/add";
import categories from "#bin/metalbrain/backlog/categories";
import close from "#bin/metalbrain/backlog/close";
import create from "#bin/metalbrain/backlog/create";
import list from "#bin/metalbrain/backlog/list";
import move from "#bin/metalbrain/backlog/move";
import relocate from "#bin/metalbrain/backlog/relocate";
import show from "#bin/metalbrain/backlog/show";
import update from "#bin/metalbrain/backlog/update";
import merge from "#bin/metalbrain/merge";
import search from "#bin/metalbrain/search";
import tap from "#bin/metalbrain/tap";

export default command({
  name: "backlog",
  description: "Manage the backlog's categories and entries.",
  subcommands: [
    categories,
    list,
    search,
    show,
    tap,
    merge,
    create,
    add,
    update,
    move,
    relocate,
    close,
  ],
});
