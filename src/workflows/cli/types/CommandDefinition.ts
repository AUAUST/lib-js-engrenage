import type { Command } from "@commander-js/extra-typings";

import type { commandRegistration } from "#workflows/cli/constants";

export interface CommandDefinition {
  [commandRegistration](command: Command): void;
}
