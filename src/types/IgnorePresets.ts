import type { GlobGroup } from "#types/GlobGroup";

/**
 * The glob groups an ignore file's `@ignore <preset>` block lists, by preset
 * name, computed when the block syncs.
 */
export type IgnorePresets = Readonly<
  Record<string, () => readonly GlobGroup[]>
>;
