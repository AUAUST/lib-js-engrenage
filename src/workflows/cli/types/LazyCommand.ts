import type { LegacyCommandDefinition } from "#workflows/cli/types/LegacyCommandDefinition";

export interface LazyCommand {
  readonly description: string;
  readonly aliases?: readonly string[];
  load(): Promise<LegacyCommandDefinition>;
}
