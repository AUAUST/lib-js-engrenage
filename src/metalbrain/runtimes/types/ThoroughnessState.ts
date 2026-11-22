import type { ThoroughnessLevel } from "#metalbrain/runtimes/types/ThoroughnessLevel";
import type { ThoroughnessWarning } from "#metalbrain/runtimes/types/ThoroughnessWarning";

/**
 * A subagent's thoroughness state: its level and token limit, the warnings it
 * was given, and its current contact, opened by its brief or its caller's latest
 * message: the context of the contact's first call and the index of its first
 * warning, with the transcript bytes scanned for caller messages.
 */
export interface ThoroughnessState {
  readonly level: ThoroughnessLevel;
  readonly limit: number;
  readonly warnings: readonly ThoroughnessWarning[];
  readonly start: number;
  readonly opened: number;
  readonly scanned: number;
}
