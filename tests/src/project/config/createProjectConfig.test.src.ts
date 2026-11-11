import { boolean } from "valibot";
import { describe, expect, test } from "vitest";

import { values } from "@auaust/toolkit/object";

import {
  declare,
  declareSection,
  type Resolver,
} from "#foundation/options/index";
import { createProjectConfig } from "#project/config/operations/createProjectConfig";
import { validateConfig } from "#project/config/operations/validateConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import type {
  EntryShape,
  ExtensionShape,
  Registry,
} from "#foundation/extensions/index";
import type { ConfigContext } from "#project/config/types/ConfigContext";
import type { ConfigResolver } from "#project/config/types/ConfigResolver";
import type { Extension } from "#project/config/types/Extension";

import * as builtins from "#workflows/builtins/entry";

import manifest from "#package.json" with { type: "json" };

const fixture = { name: "external-fixture" };

const gatedSchema = declare(boolean(), {
  optional: { value: false },
});

const gatedSection = declareSection({
  declaration: gatedSchema,
  resolve(input): boolean {
    return gatedSchema.resolve(input, undefined, "gated");
  },
});

const gated = {
  name: "gated-fixture",
  when: {
    installed: "absent-package",
  },
  owns: {
    keys: {
      gated: {
        input: "gated",
        load() {
          return Promise.resolve(gatedSection);
        },
      },
    },
  },
  contributes: {
    "test.entries": [{ name: "gated-entry" }],
  },
};

const slotOwner = {
  name: "slot-fixture",
  owns: {
    slots: {
      "test.entries": {},
    },
  },
};

function createGatedConfig(packageJson: Readonly<Record<string, unknown>>) {
  return createProjectConfig({
    root: createTemporaryProject({
      "package.json": JSON.stringify({ name: "gated", ...packageJson }),
    }).root,
    raw: { extensions: [gated, slotOwner], gated: true },
    configFile: undefined,
  });
}

function createConfig(raw: Readonly<Record<string, unknown>>) {
  return createProjectConfig({
    root: createTemporaryProject().root,
    raw,
    configFile: undefined,
  });
}

describe("createProjectConfig", () => {
  test("re-resolves a memoized key reading packageJson after its file is staged", async () => {
    const project = createTemporaryProject({
      "package.json": '{ "name": "before", "type": "module" }',
    });

    const nameSection = declareSection({
      async resolve(
        _input,
        config: ConfigResolver,
      ): Promise<string | undefined> {
        return (await config.resolve("packageJson")).optional.name;
      },
    });

    const extension = {
      name: "name-fixture",
      owns: {
        keys: {
          name: {
            load() {
              return nameSection;
            },
          },
        },
      },
    } satisfies Extension;

    const config: Resolver<ConfigContext> = createProjectConfig({
      root: project.root,
      raw: { extensions: [extension] },
      configFile: undefined,
    });

    expect(await config.resolve("name")).toBe("before");

    await config.context.filesystem.write(
      config.context.path("package.json"),
      '{ "name": "after", "type": "module" }',
    );

    expect(await config.resolve("name")).toBe("after");
  });

  test("registers the built-ins without listed extensions", () => {
    expect(createConfig({}).context.registry.extensions).toEqual(
      values(builtins).flat(),
    );
  });

  test("collects nested extension lists flattened in listed order", () => {
    const [a, b, c] = ["a", "b", "c"].map((name) => {
      return { name };
    });

    const listed = createConfig({
      extensions: [[a, b], c],
    }).context.registry.extensions.slice(-3);

    expect(listed).toEqual([a, b, c]);
  });

  test("rejects an extension incompatible with the running engrenage, naming both versions", () => {
    expect(() => {
      return createConfig({
        extensions: [
          {
            name: "future",
            compatibility: { engrenage: "^99" },
          },
        ],
      });
    }).toThrow(
      `future requires engrenage ^99, but ${manifest.version} is installed`,
    );
  });

  test("rejects an extension listed twice", () => {
    expect(() => createConfig({ extensions: [fixture, fixture] })).toThrow(
      'Extension "external-fixture" is registered twice',
    );
  });

  test("rejects a listed value that is not an extension, naming its index", () => {
    expect(() => createConfig({ extensions: [1] })).toThrow(
      /Invalid extensions config[\s\S]*at 0/u,
    );
  });

  test("rejects a listed extension whose slot entries are not a list, naming the path", () => {
    expect(() => {
      return createConfig({
        extensions: [
          {
            name: "x",
            contributes: {
              "sync.targets": {},
            },
          },
        ],
      });
    }).toThrow(
      /Invalid extensions config[\s\S]*at 0\.contributes\.sync\.targets/u,
    );
  });

  test("rejects a listed extension owning a key without load, naming the path", () => {
    expect(() => {
      return createConfig({
        extensions: [
          {
            name: "x",
            owns: {
              keys: {
                x: {},
              },
            },
          },
        ],
      });
    }).toThrow(/Invalid extensions config[\s\S]*at 0\.owns\.keys\.x\.load/u);
  });

  test("keeps every field of a listed extension's contributed entries", () => {
    const entry = {
      name: "entry",
      flags: { mode: "strict" },
      load() {
        return Promise.resolve(undefined);
      },
    };

    const extension = {
      name: "x",
      contributes: { "test.entries": [entry] },
    };

    expect(
      createConfig({ extensions: [slotOwner, extension] }).context.registry
        .extensions,
    ).toContainEqual(extension);
  });

  test("refuses the keys of an inactive owner on read, still validating their input", async () => {
    const config = createGatedConfig({});

    const registry: Registry<
      ExtensionShape<object, Readonly<Record<string, readonly EntryShape[]>>>
    > = config.context.registry;

    const open: Resolver<ConfigContext> = config;

    expect(await registry.contributions("test.entries", config)).toEqual([]);

    await expect(open.resolve("gated")).rejects.toThrow(
      'Config key "gated" belongs to gated-fixture, which is inactive: install absent-package',
    );

    await expect(validateConfig(config)).resolves.toBe(config);
  });

  test("refuses the keys of an owner with unmet requirements", async () => {
    const open: Resolver<ConfigContext> = createConfig({
      extensions: [
        {
          name: "needs-eslint",
          requires: ["tools/eslint"],
          owns: {
            keys: {
              needsEslint: {
                input: "needsEslint",
                load() {
                  return Promise.resolve(gatedSection);
                },
              },
            },
          },
        },
      ],
    });

    await expect(open.resolve("needsEslint")).rejects.toThrow(
      'Config key "needsEslint" belongs to needs-eslint, whose requirements are unmet: needs-eslint requires tools/eslint, which is inactive: install eslint',
    );
  });

  test("resolves the keys of an owner whose package is installed", async () => {
    const open: Resolver<ConfigContext> = createGatedConfig({
      devDependencies: { "absent-package": "1.0.0" },
    });

    expect(await open.resolve("gated")).toBe(true);
  });
});
