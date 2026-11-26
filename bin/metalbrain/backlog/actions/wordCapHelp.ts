import type { CommandUnknownOpts } from "@commander-js/extra-typings";

import { backlog } from "#metalbrain/backlog/constants";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (command: CommandUnknownOpts): Promise<void> {
  const config = await loadValidatedConfig(process.cwd(), {
    reporter: getRunContext().reporter,
  });

  const { wordCaps } = await config.resolve("agents");

  command.addHelpText(
    "after",
    `\nAn entry holds at most ${wordCaps[backlog.wordCap]} words across its title and details, sites aside: the ${backlog.wordCap} word cap.`,
  );
}
