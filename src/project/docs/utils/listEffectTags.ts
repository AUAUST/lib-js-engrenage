import { picklist } from "valibot";

import { freeze } from "@auaust/toolkit/object";

import { defaultEffectLevels } from "#batiment/effects/constants";
import type { TagDeclaration } from "#project/docs/types/TagDeclaration";

/**
 * Declares the effect doc tags of a symbol's invocation level: `@effect`
 * naming one of `levels`, and a body-less shorthand per default level, each
 * excluding the others.
 */
export function listEffectTags(
  levels: readonly string[],
): readonly TagDeclaration[] {
  const names = ["effect", ...defaultEffectLevels];

  function excluding(name: string) {
    return freeze(names.filter((other) => other !== name));
  }

  return freeze([
    freeze({
      name: "effect",
      body: "inline",
      schema: picklist(
        [...levels],
        `Expected one of the effect levels ${levels.join(", ")}`,
      ),
      excludes: excluding("effect"),
    }),
    ...defaultEffectLevels.map((level) => {
      return freeze({
        name: level,
        body: "none",
        excludes: excluding(level),
      } as const);
    }),
  ]);
}
