import {
  escapedBackslash,
  globCharacters,
} from "#foundation/filesystem/constants";
import type { File } from "#types/File";
import type { Glob } from "#types/Glob";

/**
 * Escapes `path` into a glob matching only it, each glob character as a
 * one-character class: `[*]`, and `[\\]` for a backslash. picomatch and
 * `createGlobMatcher` read it so; Node's glob misreads `[!]`, `[\\]` and
 * braces holding a comma.
 */
export function escapeGlob(path: File): Glob {
  let glob = "";

  for (const character of path) {
    if (character === "\\") {
      glob += escapedBackslash;
    } else if (globCharacters.includes(character)) {
      glob += `[${character}]`;
    } else {
      glob += character;
    }
  }

  return glob;
}
