import { describe, expect, test } from "vitest";

import * as builtins from "@auaust/engrenage/builtins";
import {
  camel,
  isArray,
  isFunction,
  isObject,
  isPlainObject,
} from "@auaust/toolkit";
import { entries, values } from "@auaust/toolkit/object";

interface Loader {
  path: string;
  load(): unknown;
}

function* findLoaders(value: unknown, path: string): Generator<Loader> {
  if (isArray(value)) {
    for (const [index, item] of value.entries()) {
      yield* findLoaders(item, `${path}[${index}]`);
    }

    return;
  }

  if (!isPlainObject(value)) {
    return;
  }

  for (const [key, item] of entries(value)) {
    if (key === "load" && isFunction(item)) {
      yield { path, load: () => item.call(value) };
    } else {
      yield* findLoaders(item, `${path}.${key}`);
    }
  }
}

describe("builtins", () => {
  test("exports each extension, sub-domains included, under its domain path", () => {
    const names = entries(builtins).map(([exported, { name }]) => {
      expect(camel(name.replaceAll("/", " "))).toBe(exported);

      return name;
    });

    expect(names).toEqual(
      expect.arrayContaining([
        "tools/agents",
        "tools/agents/claude",
        "tools/agents/codex",
        "tools/shopify/theme",
      ]),
    );
  });

  test("loads each lazy value by its export name, never as a module namespace", async () => {
    const loaders = values(builtins).flatMap((extension) => {
      return [...findLoaders(extension, extension.name)];
    });

    expect(loaders.length).toBeGreaterThan(0);

    const namespaces: string[] = [];

    for (const { path, load } of loaders) {
      const loaded = await load();

      if (
        isObject(loaded) &&
        Object.prototype.toString.call(loaded) === "[object Module]"
      ) {
        namespaces.push(`${path}: ${Object.keys(loaded).join(", ")}`);
      }
    }

    expect(namespaces).toEqual([]);
  });
});
