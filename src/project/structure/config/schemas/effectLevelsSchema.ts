import { array, check, pipe, string } from "valibot";

import { defaultEffectLevels } from "#project/structure/constants";

function keepsDefaultLevels(levels: string[]): boolean {
  let position = -1;

  return defaultEffectLevels.every((level) => {
    const index = levels.indexOf(level);
    const found = index > position;

    position = index;

    return found;
  });
}

export const effectLevelsSchema = pipe(
  array(string()),
  check(
    keepsDefaultLevels,
    `The effect levels must contain ${defaultEffectLevels.join(", ")} in that order`,
  ),
);
