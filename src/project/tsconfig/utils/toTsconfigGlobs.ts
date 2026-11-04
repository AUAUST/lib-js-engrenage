import { flatMap, map } from "@auaust/primitive-kit/arrays";

import { relativeToTsconfig } from "#tsconfig/utils/relativeToTsconfig";
import type { File } from "#types/File";
import type { Glob } from "#types/Glob";

function splitBraceGroup(glob: Glob, open: number) {
  const alternatives: string[] = [];

  let depth = 0;
  let start = open + 1;

  for (let index = open; index < glob.length; index++) {
    const character = glob[index];

    if (character === "{") {
      depth++;
    } else if (character === "}") {
      depth--;

      if (depth === 0) {
        alternatives.push(glob.slice(start, index));

        return { close: index, alternatives };
      }
    } else if (character === "," && depth === 1) {
      alternatives.push(glob.slice(start, index));

      start = index + 1;
    }
  }

  throw new Error(`Unbalanced braces in glob "${glob}".`);
}

function expandBraces(glob: Glob): readonly Glob[] {
  const open = glob.indexOf("{");

  if (open === -1) {
    return [glob];
  }

  const { close, alternatives } = splitBraceGroup(glob, open);

  const prefix = glob.slice(0, open);
  const suffixes = expandBraces(glob.slice(close + 1));

  const expanded =
    alternatives.length === 1
      ? [glob.slice(open, close + 1)]
      : flatMap(alternatives, expandBraces);

  return flatMap(expanded, (alternative) => {
    return map(suffixes, (suffix) => `${prefix}${alternative}${suffix}`);
  });
}

export function toTsconfigGlobs(
  tsconfig: File,
  globs: readonly Glob[],
): readonly Glob[] {
  const expanded = flatMap(globs, expandBraces);

  return map(expanded, (glob) => relativeToTsconfig(tsconfig, glob));
}
