import type { CommandDefinition } from "#workflows/cli/types/CommandDefinition";

export interface LazyCommand {
  readonly description: string;
  readonly aliases?: readonly string[];
  load(): Promise<CommandDefinition>;
}
