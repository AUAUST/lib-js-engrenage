import { matchesGlob } from "node:path";

import { parse } from "valibot";

import { isPlainObject, isString } from "@auaust/toolkit";
import { entries, values } from "@auaust/toolkit/object";

import { effectModuleSchema } from "#batiment/roles/config/schemas/effectModuleSchema";
import type { ResolvedEffects } from "#batiment/roles/types/ResolvedEffects";

export function rankModule(
  { levels, modules, fallback }: ResolvedEffects,
  specifier: string,
  binding?: string,
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
    const resolved = isPlainObject(ranking)
      ? entries(ranking).find(([pattern]) => {
          return pattern === specifier || matchesGlob(specifier, pattern);
        })?.[1]
      : ranking(specifier);

    if (resolved === undefined) {
      continue;
    }

    const entry = parse(effectModuleSchema, resolved);

    if (isString(entry)) {
      return check(entry);
    }

    const ranked = [entry.default, ...values(entry.symbols)];

    for (const level of ranked) {
      check(level);
    }

    if (binding !== undefined) {
      return entry.symbols[binding] ?? entry.default;
    }

    return ranked.reduce((highest, level) => {
      return levels.indexOf(level) > levels.indexOf(highest) ? level : highest;
    });
  }

  return check(fallback);
}
