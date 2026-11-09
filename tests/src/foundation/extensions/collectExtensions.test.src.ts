import { describe, expect, test, vi } from "vitest";

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

  test("calls no load function or activation at collection", () => {
    const load = vi.fn(() => {
      throw new Error("loaded");
    });

    const isActive = vi.fn(() => {
      throw new Error("evaluated");
    });

    collectExtensions<TestExtension>(
      [
        {
          name: "host",
          owns: {
            slots: {
              done: { kind: "hook" },
            },
          },
        },
        {
          name: "subscriber",
          contributes: { done: [{ load }] },
        },
      ],
      {
        slotKind: "slots",
        isActive,
      },
    );

    expect(load).not.toHaveBeenCalled();
    expect(isActive).not.toHaveBeenCalled();
  });

  test("orders entries stage by stage, edges inside a stage, ties in registration order", async () => {
    const registry = collect([
      {
        name: "host",
        owns: {
          slots: {
            targets: { stages: ["write", "check"], edges: true },
          },
        },
      },
      {
        name: "first",
        contributes: {
          targets: [
            {
              name: "first-check",
              stage: "check",
            },
            {
              name: "first-write",
              stage: "write",
              reads: ["tsconfig"],
            },
          ],
        },
      },
      {
        name: "second",
        contributes: { targets: [{ name: "second-write", stage: "write" }] },
      },
      {
        name: "third",
        contributes: {
          targets: [
            {
              name: "third-write",
              stage: "write",
              produces: ["tsconfig"],
            },
            {
              name: "third-check",
              stage: "check",
            },
          ],
        },
      },
    ]);

    const contributions = await registry.contributions("targets");

    expect(contributions.map(({ entry }) => entry.name)).toEqual([
      "second-write",
      "third-write",
      "first-write",
      "first-check",
      "third-check",
    ]);
  });

  test("orders a reader after the producer the injected relation matches", async () => {
    const registry = collect(
      [
        {
          name: "host",
          owns: {
            slots: {
              targets: { edges: true },
            },
          },
        },
        {
          name: "reader",
          contributes: { targets: [{ reads: ["package.json"] }] },
        },
        {
          name: "producer",
          contributes: { targets: [{ produces: ["package.json#imports"] }] },
        },
      ],
      {
        matches: (read, produced) => {
          return produced === read || produced.startsWith(`${read}#`);
        },
      },
    );

    const contributions = await registry.contributions("targets");

    expect(contributions.map(({ extension }) => extension.name)).toEqual([
      "producer",
      "reader",
    ]);
  });

  test.each<[string, readonly TestExtension[], string]>([
    [
      "an undeclared stage",
      [
        {
          name: "host",
          owns: {
            slots: {
              targets: { stages: ["write"] },
            },
          },
        },
        {
          name: "first",
          contributes: { targets: [{ stage: "check" }] },
        },
      ],
      'first\'s entry 0 in slot "targets" names stage "check", not one of: write',
    ],
    [
      "reads on a slot without edges",
      [
        {
          name: "host",
          owns: {
            slots: {
              targets: {},
            },
          },
        },
        {
          name: "first",
          contributes: { targets: [{ reads: ["tsconfig"] }] },
        },
      ],
      'first\'s entry 0 in slot "targets" declares reads or produces, but the slot has no edges',
    ],
    [
      "a nameless bucket entry",
      [
        {
          name: "host",
          owns: {
            slots: {
              adapter: { cardinality: "one" },
            },
          },
        },
        {
          name: "first",
          contributes: { adapter: [{}] },
        },
      ],
      'first\'s entry 0 in slot "adapter" has no name, which a bucket requires',
    ],
    [
      "a duplicate entry name",
      [
        {
          name: "host",
          owns: {
            slots: {
              targets: {},
            },
          },
        },
        {
          name: "first",
          contributes: { targets: [{ name: "git" }] },
        },
        {
          name: "second",
          contributes: { targets: [{ name: "git" }] },
        },
      ],
      'Slot "targets" has two entries named "git", from first and second',
    ],
    [
      "a read produced only in a later stage",
      [
        {
          name: "host",
          owns: {
            slots: {
              targets: { stages: ["write", "check"], edges: true },
            },
          },
        },
        {
          name: "first",
          contributes: {
            targets: [
              {
                name: "reader",
                stage: "write",
                reads: ["tsconfig"],
              },
              {
                name: "producer",
                stage: "check",
                produces: ["tsconfig"],
              },
            ],
          },
        },
      ],
      '"reader" from first in slot "targets" reads "tsconfig", produced in the later stage "check" by "producer" from first',
    ],
  ])("fails on %s", (_case, extensions, message) => {
    expect(() => collect(extensions)).toThrow(
      `Invalid extensions:\n${message}`,
    );
  });

  test("checks edge names against the declared kinds, whatever their owner's activation", async () => {
    const host: TestExtension = {
      name: "host",
      owns: {
        slots: {
          targets: {
            edges: { kinds: ["files"] },
          },
        },
      },
    };

    const inactive: TestExtension = {
      name: "inactive",
      when: false,
      owns: {
        files: { tsconfig: "tsconfig.json" },
      },
      contributes: { targets: [{ produces: ["tsconfig"] }] },
    };

    expect(() => {
      return collect([
        host,
        {
          name: "reader",
          contributes: { targets: [{ reads: ["missing"] }] },
        },
      ]);
    }).toThrow(
      'reader\'s entry 0 in slot "targets" names "missing", which no extension declares in files',
    );

    const registry = collect([
      host,
      {
        name: "reader",
        contributes: { targets: [{ reads: ["tsconfig"] }] },
      },
      inactive,
    ]);

    const contributions = await registry.contributions("targets");

    expect(contributions.map(({ extension }) => extension.name)).toEqual([
      "reader",
    ]);
  });

  test("fails on an active contributor requiring an inactive extension", async () => {
    const registry = collect(
      [
        {
          name: "host",
          owns: {
            slots: {
              targets: {},
            },
          },
        },
        {
          name: "missing",
          when: false,
        },
        {
          name: "first",
          requires: ["missing"],
          contributes: { targets: [{ name: "target" }] },
        },
      ],
      {
        explainInactive: ({ name }) => `${name} is not installed`,
      },
    );

    await expect(registry.contributions("targets")).rejects.toThrow(
      "first requires missing, which is inactive: missing is not installed",
    );

    await expect(registry.isActive("unknown")).rejects.toThrow(
      'Unknown extension "unknown"',
    );
  });

  test("resolves a requires cycle between active extensions", async () => {
    const registry = collect([
      { name: "first", requires: ["second"] },
      { name: "second", requires: ["first"] },
    ]);

    expect(await registry.isActive("first")).toBe(true);
  });

  test("selects the named active entry of a bucket", async () => {
    const registry = collect([
      {
        name: "host",
        owns: {
          slots: {
            adapter: { cardinality: "one" },
          },
        },
      },
      {
        name: "node",
        contributes: { adapter: [{ name: "node" }] },
      },
      {
        name: "bun",
        when: false,
        contributes: { adapter: [{ name: "bun" }] },
      },
      {
        name: "deno",
        contributes: { adapter: [{ name: "deno" }] },
      },
    ]);

    const selected = await registry.select("adapter", "deno");

    expect(selected.extension.name).toBe("deno");

    await expect(registry.select("adapter", "missing")).rejects.toThrow(
      'Slot "adapter" has no entry "missing"; active entries: node, deno',
    );

    await expect(registry.select("adapter", "bun")).rejects.toThrow(
      'Entry "bun" of slot "adapter" belongs to bun, which is inactive',
    );
  });

  test("emits to subscribers one after the other", async () => {
    const events: string[] = [];

    function subscriber(name: string): HookEntry<string> {
      return {
        load() {
          events.push(`${name} loaded`);

          return Promise.resolve(async (payload) => {
            await new Promise((resolve) => {
              setTimeout(resolve, 10);
            });

            events.push(`${name} received ${payload}`);
          });
        },
      };
    }

    const registry = collect([
      {
        name: "host",
        owns: {
          slots: {
            done: { kind: "hook" },
          },
        },
      },
      {
        name: "first",
        contributes: { done: [subscriber("first")] },
      },
      {
        name: "second",
        contributes: { done: [subscriber("second")] },
      },
    ]);

    await registry.emit("done", "sync");

    expect(events).toEqual([
      "first loaded",
      "first received sync",
      "second loaded",
      "second received sync",
    ]);
  });

  test("stops emitting at the first rejection", async () => {
    const error = new Error("failed");

    const second = vi.fn(() => Promise.resolve(() => {}));

    const registry = collect([
      {
        name: "host",
        owns: {
          slots: {
            done: { kind: "hook" },
          },
        },
      },
      {
        name: "first",
        contributes: {
          done: [
            {
              load: () => Promise.resolve(() => Promise.reject(error)),
            },
          ],
        },
      },
      {
        name: "second",
        contributes: { done: [{ load: second }] },
      },
    ]);

    await expect(registry.emit("done", "sync")).rejects.toBe(error);

    expect(second).not.toHaveBeenCalled();
  });
});
