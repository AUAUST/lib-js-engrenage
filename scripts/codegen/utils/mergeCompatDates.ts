import { sort } from "@auaust/primitive-kit/arrays";
import type { Maybe } from "@auaust/toolkit/types";

export function mergeCompatDates(
  dates: readonly Maybe<string>[],
): Maybe<string> | undefined {
  if (dates.includes(null)) {
    return null;
  }

  return dates.length === 0 ? undefined : sort([...dates] as string[]).at(-1);
}
