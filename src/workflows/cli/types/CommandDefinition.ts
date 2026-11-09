import type { Command } from "@commander-js/extra-typings";

import type {
  commandExtension,
  commandRegistration,
} from "#workflows/cli/constants";

export interface CommandDefinition {
  [commandRegistration](command: Command): void;
  [commandExtension]?(command: Command): Promise<void>;
}
