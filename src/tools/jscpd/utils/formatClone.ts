import type { Clone } from "#tools/jscpd/types/Clone";
import type { CloneFragment } from "#tools/jscpd/types/CloneFragment";

function formatFragment({ file, start, end }: CloneFragment): string {
  return `${file}:${start}-${end}`;
}

export function formatClone({ lines, fragments: [first, second] }: Clone) {
  return `${formatFragment(first)} duplicates ${formatFragment(second)} (${lines} lines)`;
}
