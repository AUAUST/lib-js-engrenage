import { Option, type CommandUnknownOpts } from "@commander-js/extra-typings";

import { findLogKind } from "#metalbrain/logs/index";

export default function (command: CommandUnknownOpts): void {
  const kind = findLogKind(command.parent?.name() ?? "");

  for (const [key, { type }] of Object.entries(kind.fields)) {
    if (type === "line") {
      command.addOption(
        new Option(`--${key} <text>`, `only entries whose ${key} is <text>`),
      );
    }
  }
}
