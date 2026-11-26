import type { Command } from "@commander-js/extra-typings";

import type {
  commandExtension,
  commandForwarding,
  commandRegistration,
} from "#nexus/cli/constants";

export interface CommandDefinition {
  [commandRegistration](command: Command): void;
  [commandExtension]?(command: Command): Promise<void>;
  /**
   * Whether the command forwards its arguments as they come, so it takes no
   * run options of its own.
   */
  readonly [commandForwarding]?: true;
}
