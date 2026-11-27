import { isArray, isPlainObject, isString } from "@auaust/toolkit";
import { difference, toDeduplicated } from "@auaust/toolkit/array";
import { entries, keys } from "@auaust/toolkit/object";

import { resolveListOption } from "#foundation/options/utils/resolveListOption";
import type { WarningReporter } from "#foundation/options/ports/WarningReporter";
import type { InputLayer } from "#foundation/options/types/InputLayer";
import type { ListAdjustment } from "#foundation/options/types/ListAdjustment";

const adjustmentKeys = new Set(["prepend", "append", "exclude"]);

function isStringList(value: unknown): value is string[] {
  return isArray(value) && value.every(isString);
}

function isAdjustment(value: unknown): value is ListAdjustment<string> {
  return (
    isPlainObject(value) &&
    entries(value).every(([key, items]) => {
      return (
        adjustmentKeys.has(key) && (isString(items) || isStringList(items))
      );
    })
  );
}

function toItems(items: string | readonly string[] | undefined) {
  if (items === undefined) {
    return [];
  }

  return isString(items) ? [items] : items;
}

// @debt an item `higher` excludes that `lower` adds and the base also holds stays in the base, since the composed exclusion omits it to avoid warning that the base lacks it
function composeAdjustments(
  higher: ListAdjustment<string>,
  lower: ListAdjustment<string>,
): ListAdjustment<string> {
  const excluded = toItems(higher.exclude);
  const prepended = toItems(lower.prepend);
  const appended = toItems(lower.append);

  return {
    prepend: [...toItems(higher.prepend), ...difference(prepended, excluded)],
    append: [...difference(appended, excluded), ...toItems(higher.append)],
    exclude: toDeduplicated([
      ...toItems(lower.exclude),
      ...difference(excluded, [...prepended, ...appended]),
    ]),
  };
}

interface Placement {
  readonly fallback: unknown;
  readonly path: string;
  readonly layer: string;
  readonly origins: Map<string, string>;
  readonly reporter: WarningReporter;
}

// @debt a list adjustment is recognized by its shape and the default's, not by the option declared at the path
function combine(explicit: unknown, placement: Placement): unknown {
  const { fallback, path, layer, origins, reporter } = placement;

  if (explicit === undefined || (explicit === true && isStringList(fallback))) {
    origins.set(path, layer);

    return fallback;
  }

  if (isAdjustment(explicit) && isAdjustment(fallback)) {
    return composeAdjustments(explicit, fallback);
  }

  if (!isStringList(fallback)) {
    return explicit;
  }

  return isAdjustment(explicit)
    ? resolveListOption(explicit, () => fallback, path, reporter)
    : explicit;
}

function place(
  current: unknown,
  segments: readonly string[],
  placement: Placement,
): unknown {
  const [head, ...rest] = segments;

  if (head === undefined) {
    return combine(current, placement);
  }

  // @debt creating the parent object skips the default an object option computes when its input is unset
  if (current === undefined) {
    return { [head]: place(undefined, rest, placement) };
  }

  if (!isPlainObject(current)) {
    return current;
  }

  if (
    rest.length === 0 &&
    adjustmentKeys.has(head) &&
    keys(current).length > 0 &&
    isAdjustment(current) &&
    (isString(placement.fallback) || isStringList(placement.fallback))
  ) {
    return composeAdjustments(current, { [head]: placement.fallback });
  }

  return {
    ...current,
    [head]: place(current[head], rest, placement),
  };
}

export function applyInputDefaults(
  input: unknown,
  name: string,
  layers: readonly InputLayer[],
  reporter: WarningReporter,
): { readonly value: unknown; readonly origins: ReadonlyMap<string, string> } {
  const origins = new Map<string, string>();

  let value = input;

  for (const layer of layers) {
    for (const [path, fallback] of entries(layer.values)) {
      if (path !== name && !path.startsWith(`${name}.`)) {
        continue;
      }

      const segments = path === name
        ? []
        : path.slice(name.length + 1).split(".");

      value = place(value, segments, {
        fallback,
        path,
        layer: layer.name,
        origins,
        reporter,
      });
    }
  }

  return { value, origins };
}
