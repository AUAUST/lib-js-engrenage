import type { CardinalityViolation } from "#project/structure/types/CardinalityViolation";

export function renderCardinalityViolation({
  role,
  reason,
  files,
  globs,
}: CardinalityViolation): string {
  return reason === "unique"
    ? `\`${role}\` holds at most one file here; found ${files.join(", ")}.`
    : `\`${role}\` requires a file here; add one matching ${globs.join(", ")}.`;
}
