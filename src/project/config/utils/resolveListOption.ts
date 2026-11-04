import { difference, isNotEmpty } from "@auaust/primitive-kit/arrays";
import { isArray } from "@auaust/toolkit/isArray";
import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import type { MaybeArray } from "@auaust/toolkit/types";

import type { ListAdjustment } from "#config/types/ListAdjustment";
import type { ListOption } from "#config/types/ListOption";
import type { ManagedListOption } from "#config/types/ManagedListOption";

function toItems<Item extends string>(
  value: MaybeArray<Item> | undefined,
): readonly Item[] {
  if (value === undefined) {
    return [];
  }

  return isArray(value) ? value : [value];
}

function isAdjustment<Item extends string>(
  option: ListOption<Item>,
): option is ListAdjustment<Item> {
  return isPlainObject(option);
}

function findDuplicates<Item extends string>(items: readonly Item[]): Item[] {
  const seen = new Set<Item>();
  const duplicates = new Set<Item>();

  for (const item of items) {
    if (seen.has(item)) {
      duplicates.add(item);
    }

    seen.add(item);
  }

  return [...duplicates];
}

function warnDuplicates<Item extends string>(
  items: readonly Item[],
  subject: string,
): readonly Item[] {
  const duplicates = findDuplicates(items);

  if (isNotEmpty(duplicates)) {
    console.warn(`${subject} lists ${duplicates.join(", ")} more than once`);
  }

  return items;
}

export function resolveListOption<Item extends string>(
  option: ListOption<Item> | undefined,
  defaults: () => readonly Item[],
  subject: string,
): readonly Item[];
export function resolveListOption<Item extends string>(
  option: ManagedListOption<Item> | undefined,
  defaults: () => readonly Item[],
  subject: string,
): readonly Item[] | false;
export function resolveListOption<Item extends string>(
  option: ManagedListOption<Item> | undefined,
  defaults: () => readonly Item[],
  subject: string,
): readonly Item[] | false {
  if (option === false) {
    return false;
  }

  if (option === undefined || option === true) {
    return defaults();
  }

  if (!isAdjustment(option)) {
    return warnDuplicates(toItems(option), subject);
  }

  const base = defaults();
  const excluded = toItems(option.exclude);

  const unmatched = difference(excluded, base);

  if (isNotEmpty(unmatched)) {
    console.warn(
      `${subject} excludes ${unmatched.join(", ")}, absent from its defaults`,
    );
  }

  return warnDuplicates(
    [
      ...toItems(option.prepend),
      ...difference(base, excluded),
      ...toItems(option.append),
    ],
    subject,
  );
}
