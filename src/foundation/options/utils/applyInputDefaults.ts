import { isArray } from "@auaust/toolkit/isArray";
import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import { isString } from "@auaust/toolkit/isString";
import { entries } from "@auaust/toolkit/object";

import { resolveListOption } from "#foundation/options/utils/resolveListOption";
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

// @debt a list adjustment is recognized by its shape and the default's, not by the option declared at the path
function combine(explicit: unknown, fallback: unknown, path: string): unknown {
  if (explicit === undefined) {
    return fallback;
  }

  if (!isStringList(fallback)) {
    return explicit;
  }

  if (explicit === true) {
    return fallback;
  }

  return isAdjustment(explicit)
    ? resolveListOption(explicit, () => fallback, path)
    : explicit;
}

function place(
  current: unknown,
  segments: readonly string[],
  fallback: unknown,
  path: string,
): unknown {
  const [head, ...rest] = segments;

  if (head === undefined) {
    return combine(current, fallback, path);
  }

  // @debt creating the parent object skips the default an object option computes when its input is unset
  if (current === undefined) {
    return { [head]: place(undefined, rest, fallback, path) };
  }

  if (!isPlainObject(current)) {
    return current;
  }

  return { ...current, [head]: place(current[head], rest, fallback, path) };
}

export function applyInputDefaults(
  input: unknown,
  name: string,
  defaults: Readonly<Record<string, unknown>>,
): unknown {
  let applied = input;

  for (const [path, fallback] of entries(defaults)) {
    if (path !== name && !path.startsWith(`${name}.`)) {
      continue;
    }

    const segments =
      path === name ? [] : path.slice(name.length + 1).split(".");

    applied = place(applied, segments, fallback, path);
  }

  return applied;
}
