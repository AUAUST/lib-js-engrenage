import type { Glob } from "#types/Glob";

export function withExtensions(
  stem: Glob,
  extensions: readonly string[],
): Glob {
  return extensions.length === 1
    ? `${stem}${extensions.join("")}`
    : `${stem}{${extensions.join(",")}}`;
}
