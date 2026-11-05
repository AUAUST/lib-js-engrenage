import type { GlobGroup } from "#types/GlobGroup";

export async function settlePreset(
  groups: Promise<readonly GlobGroup[]>,
): Promise<() => readonly GlobGroup[]> {
  try {
    const settled = await groups;

    return () => settled;
  } catch (error) {
    return () => {
      throw error;
    };
  }
}
