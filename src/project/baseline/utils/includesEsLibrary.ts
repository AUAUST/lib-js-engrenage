import { entries, keys } from "@auaust/toolkit/object";

import { editions as generatedEditions } from "#project/baseline/editions/index";

// @debt the `editions` parameter type is repeated in three modules, and an edition key in the selection is assumed to be its base.
/**
 * Whether `selection` covers `library`, an ES library or edition name: it lists
 * it, or lists an edition at or after the one holding it. `false` for a name no
 * edition holds.
 */
export function includesEsLibrary(
  selection: readonly string[],
  library: string,
  editions: Readonly<
    Record<string, Readonly<Record<string, string | null>>>
  > = generatedEditions,
): boolean {
  if (selection.includes(library)) {
    return true;
  }

  const names = keys(editions);

  const edition = entries(editions).find(([name, libraries]) => {
    return name === library || library in libraries;
  })?.[0];

  if (edition === undefined) {
    return false;
  }

  return selection.some((name) => {
    return (
      names.includes(name) && names.indexOf(name) >= names.indexOf(edition)
    );
  });
}
