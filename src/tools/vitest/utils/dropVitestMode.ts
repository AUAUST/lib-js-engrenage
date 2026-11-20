import { includes } from "@auaust/toolkit/array";
import { entries } from "@auaust/toolkit/object";

import { vitestModes } from "#tools/vitest/constants";

/**
 * Drops a leading Vitest command selecting `mode` from `args`, which Vitest would
 * otherwise read as a file filter after the mode the caller adds.
 *
 * @throws {Error} When `args` starts with a command selecting another mode.
 */
export function dropVitestMode(
  mode: keyof typeof vitestModes,
  args: readonly string[],
): string[] {
  const [first, ...rest] = args;

  if (first == null) {
    return [];
  }

  if (includes(vitestModes[mode], first)) {
    return rest;
  }

  for (const [other, commands] of entries(vitestModes)) {
    if (includes(commands, first)) {
      throw new Error(
        `\`${first}\` selects Vitest's ${other} mode, but this command runs its ${mode} mode.`,
      );
    }
  }

  return [...args];
}
