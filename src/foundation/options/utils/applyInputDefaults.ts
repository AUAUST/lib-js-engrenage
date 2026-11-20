import { isArray, isPlainObject, isString } from "@auaust/toolkit";
import { entries } from "@auaust/toolkit/object";

import { resolveListOption } from "#foundation/options/utils/resolveListOption";
import type { InputLayer } from "#foundation/options/types/InputLayer";
import type { ListAdjustment } from "#foundation/options/types/ListAdjustment";
import type { Reporter } from "#foundation/reports/index";

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

interface Placement {
  readonly fallback: unknown;
  readonly path: string;
  readonly layer: string;
  readonly origins: Map<string, string>;
  readonly reporter: Reporter;
}

// @debt a list adjustment is recognized by its shape and the default's, not by the option declared at the path
function combine(explicit: unknown, placement: Placement): unknown {
  const { fallback, path, layer, origins, reporter } = placement;

  if (explicit === undefined || (explicit === true && isStringList(fallback))) {
    origins.set(path, layer);

    return fallback;
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

  return {
    ...current,
    [head]: place(current[head], rest, placement),
  };
}

export function applyInputDefaults(
  input: unknown,
  name: string,
  layers: readonly InputLayer[],
  reporter: Reporter,
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
