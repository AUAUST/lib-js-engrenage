import { isDeepStrictEqual } from "node:util";

import { sort } from "@auaust/toolkit/array";
import { entries, hasOwn, keys, record } from "@auaust/toolkit/object";

import type { JsonValue } from "#foundation/json/index";
import type { File } from "#types/File";

function sortByKey<Item extends readonly [string, unknown]>(items: Item[]) {
  return sort(items, ([a], [b]) => {
    return a < b ? -1 : a > b ? 1 : 0;
  });
}

export function mergeGenerated<Value extends JsonValue>(
  file: File,
  current: Readonly<Record<string, Value>>,
  generated: Readonly<Record<string, Value>>,
  recorded: readonly string[] | undefined,
  matches: (current: Value, generated: Value) => boolean,
): Record<string, Value> {
  const previous = (
    recorded ??
    keys(current).filter((key) => {
      return hasOwn(generated, key) && matches(current[key], generated[key]);
    })
  );

  const hand = entries(current).filter(([key]) => !previous.includes(key));

  for (const [key, value] of hand) {
    if (hasOwn(generated, key) && !isDeepStrictEqual(value, generated[key])) {
      throw new Error(
        `${file}: hand-declared ${key} → ${JSON.stringify(value)} collides with the generated ${key} → ${JSON.stringify(generated[key])}; rename it`,
      );
    }
  }

  const kept = hand.filter(([key]) => !hasOwn(generated, key));

  return record(sortByKey([...kept, ...entries(generated)]));
}
