import type { Directory } from "#types/Directory";

let hasWarned = false;

export function warnMissingConfig(root: Directory) {
  if (hasWarned) {
    return;
  }

  hasWarned = true;

  console.warn(`No engrenage.config.ts found in ${root}, using defaults`);
}
