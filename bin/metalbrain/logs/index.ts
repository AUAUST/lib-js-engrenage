import { command, type CommandDeclaration } from "#nexus/cli/index";

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
  name,
  taps,
}: {
  name: string;
  taps?: boolean;
}): CommandDeclaration {
  return command({
    name,
    description: `Manage the ${name} log's entries.`,
    subcommands: [
      add,
      list,
      search,
      show,
      ...(taps === true ? [tap, merge] : []),
      update,
      close,
      stats,
    ],
  });
}
