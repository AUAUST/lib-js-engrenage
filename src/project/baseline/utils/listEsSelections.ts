import { values } from "@auaust/toolkit/object";

import { baselineWidelyAvailableMonths } from "#project/baseline/constants";
import { editions as generatedEditions } from "#project/baseline/editions/index";
import { addMonths } from "#project/baseline/utils/addMonths";
import { selectEsLibraries } from "#project/baseline/utils/selectEsLibraries";

/**
 * Each distinct library list `selectEsLibraries` returns, with the first month
 * it applies from, in ascending order; the first entry starts at the earliest
 * snapshot with a selection.
 */
export function listEsSelections(
  editions: Readonly<
    Record<string, Readonly<Record<string, string | null>>>
  > = generatedEditions,
): readonly { from: string; lib: readonly string[] }[] {
  // @debt the candidate months are derived from the selection rule instead of from the selection itself, so a change to the rule must be mirrored here.
  const months = new Set<string>();

  for (const libraries of values(editions)) {
    for (const date of values(libraries)) {
      if (date === null) {
        continue;
      }

      const month = addMonths(date, baselineWidelyAvailableMonths).slice(0, 7);

      months.add(month);
      months.add(addMonths(`${month}-01`, 1).slice(0, 7));
    }
  }

  const selections: { from: string; lib: readonly string[] }[] = [];

  for (const from of [...months].sort()) {
    const library = selectEsLibraries(from, editions);
    const previous = selections.at(-1)?.lib;

    if (library !== undefined && library.join() !== previous?.join()) {
      selections.push({ from, lib: library });
    }
  }

  return selections;
}
