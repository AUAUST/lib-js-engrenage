import { defineGroup } from "#workflows/cli/index";

import add from "#bin/metalbrain/logs/add";
import close from "#bin/metalbrain/logs/close";
import list from "#bin/metalbrain/logs/list";
import show from "#bin/metalbrain/logs/show";
import stats from "#bin/metalbrain/logs/stats";
import update from "#bin/metalbrain/logs/update";
import merge from "#bin/metalbrain/merge";
import search from "#bin/metalbrain/search";
import tap from "#bin/metalbrain/tap";

// @debt every log kind lists `tap` and `merge`, the pending log too, which takes no taps and fails on both, since the group serves every log kind with one command set
export default defineGroup({
  configure(command) {
    return command.description(`Manage the ${command.name()} log's entries.`);
  },
  commands: {
    add,
    list,
    search,
    show,
    tap,
    merge,
    update,
    close,
    stats,
  },
});
