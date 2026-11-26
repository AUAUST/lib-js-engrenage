import type { CommanderError } from "@commander-js/extra-typings";

import { CommandUsageError } from "#nexus/cli/errors/CommandUsageError";

// @debt strips the `error: ` prefix Commander formats its messages with, which no Commander API exposes apart
export function toUsageError({
  code,
  message,
}: CommanderError): CommandUsageError {
  return new CommandUsageError(
    code === "commander.help"
      ? "no command given"
      : message.replace(/^error: /u, ""),
  );
}
