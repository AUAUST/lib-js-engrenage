import { braceExpand } from "minimatch";

import { map } from "@auaust/toolkit/array";

import type { Glob } from "#types/Glob";

/**
 * The ignore-file patterns matching a glob from the project root: one per brace
 * alternative, since ignore files have no braces, each anchored to the root.
 */
// @debt minimatch's braceExpand unescapes `\{`, so a glob matching a literal brace renders an unescaped one
export function anchorGlobs(glob: Glob): readonly Glob[] {
  return map(braceExpand(glob), (pattern) => {
    return pattern.startsWith("!") ? `!/${pattern.slice(1)}` : `/${pattern}`;
  });
}
