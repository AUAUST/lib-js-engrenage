import { isPlainObject } from "@auaust/toolkit";
import { entries } from "@auaust/toolkit/object";

import type { InputLayer } from "#foundation/options/types/InputLayer";
import type { ValueOrigin } from "#foundation/options/types/ValueOrigin";

function covers(
  value: unknown,
  prefix: string,
  segments: readonly string[],
  replaced: (path: string) => boolean,
): boolean {
  if (value === undefined || replaced(prefix)) {
    return false;
  }

  if (!isPlainObject(value)) {
    return true;
  }

  const [head, ...rest] = segments;

  if (head !== undefined) {
    return covers(value[head], `${prefix}.${head}`, rest, replaced);
  }

  const children = entries(value);

  return (
    children.length === 0 ||
    children.some(([child, nested]) => {
      return covers(nested, `${prefix}.${child}`, [], replaced);
    })
  );
}

function splitPath(path: string, under: string): string[] | undefined {
  if (path === under) {
    return [];
  }

  return path.startsWith(`${under}.`)
    ? path.slice(under.length + 1).split(".")
    : undefined;
}

export function findValueOrigin(
  input: unknown,
  name: string,
  path: string,
  layers: readonly InputLayer[],
  origins: ReadonlyMap<string, string>,
): ValueOrigin {
  const segments = splitPath(path, name);

  if (segments === undefined) {
    throw new Error(`Option path "${path}" is not under input "${name}"`);
  }

  if (covers(input, name, segments, (placed) => origins.has(placed))) {
    return { layer: "input" };
  }

  for (const layer of layers) {
    for (const [placed, owner] of origins) {
      if (owner !== layer.name) {
        continue;
      }

      const rest = splitPath(path, placed);

      const set = (
        splitPath(placed, path) !== undefined ||
        (rest !== undefined &&
          covers(layer.values[placed], placed, rest, (nested) => {
            return nested !== placed && origins.has(nested);
          }))
      );

      if (set) {
        return { layer: "default", name: layer.name };
      }
    }
  }

  return { layer: "declaration" };
}
