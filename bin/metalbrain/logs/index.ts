import { defineGroup, type CommandDefinition } from "#nexus/cli/index";

import add from "#bin/metalbrain/logs/add";
import close from "#bin/metalbrain/logs/close";
import list from "#bin/metalbrain/logs/list";
import show from "#bin/metalbrain/logs/show";
import stats from "#bin/metalbrain/logs/stats";
import update from "#bin/metalbrain/logs/update";
import merge from "#bin/metalbrain/merge";
import search from "#bin/metalbrain/search";
import tap from "#bin/metalbrain/tap";

export function defineLogGroup({
  taps,
}: {
  taps?: boolean;
}): CommandDefinition {
  return defineGroup({
    configure(command) {
      return command.description(`Manage the ${command.name()} log's entries.`);
    },
    commands: {
      add,
      list,
      search,
      show,
      ...(taps && { tap, merge }),
      update,
      close,
      stats,
    },
  });
}
