import { matchesGlob } from "node:path";

import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import { entries } from "@auaust/toolkit/object";

import { effectfulModules } from "#project/structure/constants";
import type { ResolvedEffects } from "#project/structure/types/ResolvedEffects";

export function rankModule(
  { levels, modules, fallback }: ResolvedEffects,
  specifier: string,
): string | undefined {
  function check(level: string | undefined): string | undefined {
    if (level !== undefined && !levels.includes(level)) {
      throw new Error(
        `The module ${specifier} is ranked ${level}, which is not one of the effect levels ${levels.join(", ")}`,
      );
    }

    return level;
  }

  for (const ranking of modules) {
    const level = isPlainObject(ranking)
      ? entries(ranking).find(([pattern]) => {
          return pattern === specifier || matchesGlob(specifier, pattern);
        })?.[1]
      : ranking(specifier);

    if (level !== undefined) {
      return check(level);
    }
  }

  return check(
    effectfulModules.some((module) => module === specifier)
      ? "effectful"
      : fallback,
  );
}
