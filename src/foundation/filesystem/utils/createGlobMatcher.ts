import { matchesGlob } from "node:path";

import {
  escapedBackslash,
  globCharacters,
} from "#foundation/filesystem/constants";
import type { File } from "#types/File";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

const treeSuffix = "/**";

const globSyntax = new RegExp(`[${RegExp.escape(globCharacters)}]`, "u");

const nonNormalSegment = /\/\/|(?:^|\/)\.{1,2}(?:\/|$)/u;

function isLiteralPath(path: File): boolean {
  return path !== "" && !nonNormalSegment.test(path);
}

function readClass(glob: Glob, index: number): string | undefined {
  if (glob.startsWith(escapedBackslash, index)) {
    return "\\";
  }

  const character = glob[index + 1];

  return character !== undefined &&
    character !== "\\" &&
    globCharacters.includes(character) &&
    glob[index + 2] === "]"
    ? character
    : undefined;
}

/**
 * The path `glob` names when its only glob syntax is the one-character classes
 * `escapeGlob` writes, otherwise `undefined`.
 */
function readLiteral(glob: Glob): File | undefined {
  if (!globSyntax.test(glob)) {
    return isLiteralPath(glob) ? glob : undefined;
  }

  let path = "";

  for (let index = 0; index < glob.length; index++) {
    const character = glob[index] ?? "";

    if (!globCharacters.includes(character)) {
      path += character;
    } else if (character === "[") {
      const escaped = readClass(glob, index);

      if (escaped === undefined) {
        return;
      }

      path += escaped;
      index += escaped === "\\" ? escapedBackslash.length - 1 : 2;
    } else {
      return;
    }
  }

  return isLiteralPath(path) ? path : undefined;
}

function isTreeSegment(segment: string): boolean {
  return segment !== "" && !segment.startsWith(".");
}

/**
 * Compiles `globs` into a predicate answering, for a normalized relative path, as
 * `matchesGlob` with any of them would: a literal glob, one without glob syntax
 * but the classes `escapeGlob` writes, matches the path it names by set lookup,
 * and so does a literal `<directory>/**` one, without its `**` reaching dot
 * segments, as in `matchesGlob`; only the other globs are matched one by one.
 */
export function createGlobMatcher(globs: Globs): (path: File) => boolean {
  const exact = new Set<string>();
  const trees = new Set<string>();
  const patterns: Glob[] = [];

  for (const glob of globs) {
    const tree = glob.endsWith(treeSuffix)
      ? readLiteral(glob.slice(0, -treeSuffix.length))
      : undefined;

    const literal = tree === undefined ? readLiteral(glob) : undefined;

    if (tree !== undefined) {
      trees.add(tree);
    } else if (literal === undefined) {
      patterns.push(glob);
    } else {
      exact.add(literal);
    }
  }

  function inTree(path: File): boolean {
    if (trees.size === 0) {
      return false;
    }

    const segments = path.split("/");

    for (let index = segments.length - 1; index > 0; index--) {
      if (!isTreeSegment(segments[index] ?? "")) {
        return false;
      }

      if (trees.has(segments.slice(0, index).join("/"))) {
        return true;
      }
    }

    return false;
  }

  // @debt the globs with glob syntax are recompiled by `matchesGlob` for each path, since Node exposes no compiled form with its matching options
  return function matches(path: File): boolean {
    return (
      exact.has(path) ||
      inTree(path) ||
      patterns.some((pattern) => matchesGlob(path, pattern))
    );
  };
}
