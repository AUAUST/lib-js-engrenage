import { defineGroup } from "#workflows/cli/index";

import add from "#bin/metalbrain/backlog/add";
import create from "#bin/metalbrain/backlog/create";

export default defineGroup({
  configure(command) {
    return command.description(
      "Create backlog categories and entries in .ai/backlog/, checked against the backlog file schema.",
    );
  },
  commands: {
    create,
    add,
  },
});
