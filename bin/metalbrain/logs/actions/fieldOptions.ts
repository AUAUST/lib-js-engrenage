import { Option, type CommandUnknownOpts } from "@commander-js/extra-typings";

import { findLogKind } from "#metalbrain/logs/index";
import { collectArgument } from "#workflows/cli/index";

export default function (command: CommandUnknownOpts): void {
  const kind = findLogKind(command.parent?.name() ?? "");

  const adding = command.name() === "add";

  for (const [key, { type, description }] of Object.entries(kind.fields)) {
    const option = new Option(`--${key} <text>`, description);

    if (type !== "text") {
      option.argParser(collectArgument);
    } else if (adding) {
      option.makeOptionMandatory();
    }

    command.addOption(option);
  }
}
