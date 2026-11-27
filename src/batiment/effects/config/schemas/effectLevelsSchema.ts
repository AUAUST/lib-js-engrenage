import { array, check, pipe } from "valibot";

import { isString } from "@auaust/toolkit";

import { effectLevelSchema } from "#batiment/effects/config/schemas/effectLevelSchema";
import { defaultEffectLevels } from "#batiment/effects/constants";
import type { EffectLevel } from "#batiment/effects/types/EffectLevel";

function nameOf(level: EffectLevel): string {
  return isString(level) ? level : level.name;
}

function keepsDefaultLevels(levels: EffectLevel[]): boolean {
  const names = levels.map(nameOf);

  let position = -1;

  return defaultEffectLevels.every((level) => {
    const index = names.indexOf(level);
    const found = index > position;

    position = index;

    return found;
  });
}

function namesLevelsOnce(levels: EffectLevel[]): boolean {
  return new Set(levels.map(nameOf)).size === levels.length;
}

export const effectLevelsSchema = pipe(
  array(effectLevelSchema),
  check(
    keepsDefaultLevels,
    `The effect levels must contain ${defaultEffectLevels.join(", ")} in that order`,
  ),
  check(namesLevelsOnce, "The effect levels must name each level once"),
);
