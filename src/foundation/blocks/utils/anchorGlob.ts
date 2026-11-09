import type { Glob } from "#types/Glob";

export function anchorGlob(glob: Glob): Glob {
  return glob.startsWith("!") ? `!/${glob.slice(1)}` : `/${glob}`;
}
