import type { GlobGroup } from "#types/GlobGroup";

// @debt a domain contract held as a global type; belongs to the lowest domain owning it
/**
 * The glob groups an ignore file's `@ignore <preset>` block lists, by preset
 * name, computed when the block syncs.
 */
export type IgnorePresets = Readonly<
  Record<string, () => readonly GlobGroup[]>
>;
