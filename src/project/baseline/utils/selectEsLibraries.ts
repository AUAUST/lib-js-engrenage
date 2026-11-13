import { entries, values } from "@auaust/toolkit/object";

import { editions as generatedEditions } from "#project/baseline/editions/index";
import { qualifiesAtSnapshot } from "#project/baseline/utils/qualifiesAtSnapshot";

/**
 * The ES libraries widely available at `snapshot`: the latest edition whose
 * libraries all qualify, then each qualifying library of the later editions, in
 * edition order. `undefined` when the first edition does not qualify.
 */
export function selectEsLibraries(
  snapshot: string,
  editions: Readonly<
    Record<string, Readonly<Record<string, string | null>>>
  > = generatedEditions,
): readonly string[] | undefined {
  const list = entries(editions);

  let base = -1;

  for (const [position, [, libraries]] of list.entries()) {
    if (
      !values(libraries).every((date) => {
        return qualifiesAtSnapshot(date, snapshot);
      })
    ) {
      break;
    }

    base = position;
  }

  const baseEdition = list[base];

  if (baseEdition !== undefined) {
    return [
      baseEdition[0],
      ...list.slice(base + 1).flatMap(([, libraries]) => {
        return entries(libraries)
          .filter(([, date]) => {
            return qualifiesAtSnapshot(date, snapshot);
          })
          .map(([name]) => name);
      }),
    ];
  }
}
