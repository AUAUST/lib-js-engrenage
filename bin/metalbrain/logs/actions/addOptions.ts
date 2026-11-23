import { Option, type CommandUnknownOpts } from "@commander-js/extra-typings";

import { findLogKind } from "#metalbrain/logs/index";
import { collectArgument } from "#workflows/cli/index";

export default function (command: CommandUnknownOpts): void {
  const kind = findLogKind(command.parent?.name() ?? "");

  for (const [key, { type, description }] of Object.entries(kind.fields)) {
    const option = new Option(`--${key} <text>`, description);

    command.addOption(
      type === "text"
        ? option.makeOptionMandatory()
        : option.argParser(collectArgument),
    );
  }
}
