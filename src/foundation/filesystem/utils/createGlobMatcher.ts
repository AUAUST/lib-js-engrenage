import { matchesGlob } from "node:path";

import type { File } from "#types/File";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

const treeSuffix = "/**";

// @debt minimatch implements magic-detection
const magic = /[*?[\]{}()!+@\\]/u;

function isPlain(glob: Glob): boolean {
  return (
    glob !== "" &&
    !magic.test(glob) &&
    glob.split("/").every((segment, index, segments) => {
      return (
        (segment !== "" || index === 0 || index === segments.length - 1) &&
        segment !== "." &&
        segment !== ".."
      );
    })
  );
}

function isTreeSegment(segment: string): boolean {
  return segment !== "" && !segment.startsWith(".");
}

/**
 * Compiles `globs` into a predicate answering, for a normalized relative path,
 * as `matchesGlob` with any of them would: a glob without glob syntax matches by
 * set lookup, and so does a `<directory>/**` one, without its `**` reaching dot
 * segments, as in `matchesGlob`; only the other globs are matched one by one.
 */
export function createGlobMatcher(globs: Globs): (path: File) => boolean {
  const exact = new Set<string>();
  const trees = new Set<string>();
  const patterns: Glob[] = [];

  for (const glob of globs) {
    const tree = glob.endsWith(treeSuffix)
      ? glob.slice(0, -treeSuffix.length)
      : undefined;

    if (tree !== undefined && isPlain(tree)) {
      trees.add(tree);
    } else if (isPlain(glob)) {
      exact.add(glob);
    } else {
      patterns.push(glob);
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
