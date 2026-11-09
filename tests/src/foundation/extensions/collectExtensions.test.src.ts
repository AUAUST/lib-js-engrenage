import { describe, expect, test } from "vitest";

import { collectExtensions } from "#foundation/extensions/utils/collectExtensions";
import type { EntryShape } from "#foundation/extensions/types/EntryShape";
import type { ExtensionShape } from "#foundation/extensions/types/ExtensionShape";
import type { HookEntry } from "#foundation/extensions/types/HookEntry";
import type { SlotDeclaration } from "#foundation/extensions/types/SlotDeclaration";

interface TestExtension extends ExtensionShape<
  {
    readonly keys?: Readonly<Record<string, string>>;
    readonly files?: Readonly<Record<string, string>>;
    readonly slots?: Readonly<Record<string, SlotDeclaration>>;
  },
  Readonly<Record<string, readonly (EntryShape | HookEntry<string>)[]>>,
  boolean
> {}

function collect(
  extensions: readonly TestExtension[],
  options: {
    explainInactive?(extension: TestExtension): string | undefined;
    matches?(read: string, produced: string): boolean;
  } = {},
) {
  return collectExtensions(extensions, {
    slotKind: "slots",
    isActive: ({ when }) => when !== false,
    ...options,
  });
}

describe("collectExtensions", () => {
  test("reports every ownership finding in one error", () => {
    expect(() => {
      return collect([
        {
          name: "first",
          owns: {
            keys: { git: "first" },
          },
        },
        {
          name: "second",
          owns: {
            keys: { git: "second" },
          },
          contributes: { "sync.targets": [{ name: "target" }] },
        },
      ]);
    }).toThrow(
      'Invalid extensions:\n"git" in keys is owned by both first and second\nsecond contributes to slot "sync.targets", which no extension owns',
    );
  });

  test("fails on a name registered twice and an unregistered require", () => {
    expect(() => {
      return collect([
        { name: "first" },
        { name: "first", requires: ["missing"] },
      ]);
    }).toThrow(
      'Invalid extensions:\nExtension "first" is registered twice\nfirst requires missing, which is not registered',
    );
  });

  test("reads declarations in registration order, ignoring activation", () => {
    const first: TestExtension = {
      name: "first",
      owns: {
        keys: { git: "git", prettier: "prettier" },
      },
    };

    const second: TestExtension = {
      name: "second",
      when: false,
      owns: {
        keys: { eslint: "eslint" },
      },
    };

    const registry = collect([first, second]);

    expect(registry.list("keys")).toEqual([
      {
        key: "git",
        declaration: "git",
        owner: first,
      },
      {
        key: "prettier",
        declaration: "prettier",
        owner: first,
      },
      {
        key: "eslint",
        declaration: "eslint",
        owner: second,
      },
    ]);

    expect(registry.owner("keys", "unknown")).toBeUndefined();
    expect(registry.get("keys", "eslint")).toBe("eslint");
    expect(registry.owner("keys", "eslint")).toBe(second);
  });
});
