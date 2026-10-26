import type { GlobGroup } from "#types/GlobGroup";

export type IgnorePresets = Readonly<
  Record<string, () => ReadonlyArray<GlobGroup>>
>;
