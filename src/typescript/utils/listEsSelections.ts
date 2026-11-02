import { values } from "@auaust/toolkit/object";

import { baselineWidelyAvailableMonths } from "#typescript/constants";
import { editions as generatedEditions } from "#typescript/generated/editions";
import { addMonths } from "#typescript/utils/addMonths";
import { selectEsLibraries } from "#typescript/utils/selectEsLibraries";

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
