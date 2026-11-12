import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, test, vi } from "vitest";

import { createProjectConfig, type LoadedConfig } from "#project/config/index";
import { entrypoint, index } from "#project/roles/index";
import {
  collectChanges,
  runSync,
  settleChanges,
  type SyncDone,
} from "#project/sync/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { linkSourcePackage } from "#tests/utils/linkSourcePackage";

function createTarget(
  name: string,
  runs: string[],
  edges: {
    reads?: readonly string[];
    produces?: readonly string[];
  } = {},
) {
  return {
    name,
    stage: "write",
    ...edges,
    load() {
      return Promise.resolve(() => {
        runs.push(name);
      });
    },
  };
}

function createConfig(extensions: readonly unknown[]) {
  return createProjectConfig({
    root: createTemporaryProject({
      "package.json": JSON.stringify({ name: "sync-fixture" }),
    }).root,
    raw: { extensions },
    configFile: undefined,
  });
}

function createFixture(...targets: readonly unknown[]) {
  const runs: string[] = [];
  const done: SyncDone[] = [];

  const extension = {
    name: "sync-fixture",
    owns: {
      files: {
        shared: {
          locate() {
            return Promise.resolve({ file: "shared.txt" });
          },
        },
      },
    },
    contributes: {
      "sync.targets": [
        createTarget("reader", runs, { reads: ["shared"] }),
        createTarget("producer", runs, { produces: ["shared"] }),
        ...targets,
      ],
      "sync.done": [
        {
          load() {
            return Promise.resolve((payload: SyncDone) => {
              done.push(payload);
            });
          },
        },
      ],
    },
  };

  return {
    extension,
    runs,
    done,
  };
}

describe("runSync", () => {
  test("runs a target after the producer of what it reads, then reports the targets that ran", async () => {
    const { extension, runs, done } = createFixture();

    await runSync(createConfig([extension]), {
      names: ["reader", "producer"],
    });

    expect(runs).toEqual(["producer", "reader"]);

    expect(done.map(({ targets }) => targets)).toEqual([
      ["producer", "reader"],
    ]);
  });

  test("rejects an unknown target, listing the active ones", async () => {
    const { extension } = createFixture();

    await expect(
      runSync(createConfig([extension]), { names: ["nope"] }),
    ).rejects.toThrow(
      /^Unknown sync target "nope"; active targets: .*\bproducer, reader\b/u,
    );
  });

  test("rejects a target reading a name no extension declares", () => {
    const {
      extension,
    } = createFixture(createTarget("orphan", [], { reads: ["missing"] }));

    expect(() => createConfig([extension])).toThrow(
      `"orphan" from sync-fixture in slot "sync.targets" names "missing", which no extension declares in files or parts`,
    );
  });

  test("never runs nor accepts the target of an inactive extension", async () => {
    const { extension, runs } = createFixture();

    const gated = {
      name: "gated-fixture",
      when: {
        installed: "absent-package",
      },
      contributes: {
        "sync.targets": [createTarget("gated", runs)],
      },
    };

    const config = createConfig([extension, gated]);

    await expect(runSync(config, { names: ["gated"] })).rejects.toThrow(
      'Unknown sync target "gated"',
    );

    await runSync(config, { names: ["reader"] });

    expect(runs).toEqual(["reader"]);
  });

  test("flushes the written files when a check fails, then reports every failed check", async () => {
    const config = createConfig([
      {
        name: "checked-fixture",
        contributes: {
          "sync.targets": [
            ...["first", "second"].map((name) => {
              return {
                name,
                stage: "check",
                load() {
                  return Promise.resolve(() => {
                    throw new Error(`${name} violation`);
                  });
                },
              };
            }),
            {
              name: "writer",
              stage: "write",
              load() {
                return Promise.resolve(async ({ context }: typeof config) => {
                  await context.filesystem.write("written.txt", "content\n");
                });
              },
            },
          ],
        },
      },
    ]);

    const failures = await runSync(config);

    expect(failures.map(({ target }) => target)).toEqual(["first", "second"]);

    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    try {
      await settleChanges(config, { check: false, failures });

      expect(error.mock.calls).toEqual([
        ["failed: first\nfirst violation"],
        ["failed: second\nsecond violation"],
      ]);

      expect(process.exitCode).toBe(1);
    } finally {
      error.mockRestore();
      info.mockRestore();
    }

    expect(
      readFileSync(join(config.context.root, "written.txt"), "utf-8"),
    ).toBe("content\n");
  });

  test("rejects a failing write target without running the targets after it", async () => {
    const runs: string[] = [];

    const config = createConfig([
      {
        name: "failing-fixture",
        contributes: {
          "sync.targets": [
            {
              name: "broken",
              stage: "write",
              load() {
                return Promise.resolve(() => {
                  throw new Error("broken write");
                });
              },
            },
            {
              name: "later",
              stage: "check",
              load() {
                return Promise.resolve(() => {
                  runs.push("later");
                });
              },
            },
          ],
        },
      },
    ]);

    await expect(runSync(config)).rejects.toThrow("broken write");

    expect(runs).toEqual([]);
  });
});

describe("runSync with generated sources", () => {
  function createSourceProject(
    files: Record<string, string>,
    targets: readonly unknown[],
  ) {
    const project = createTemporaryProject({
      "package.json": '{ "name": "@fixture/project", "type": "module" }',
      "tsconfig.json": "{}",
      ...files,
    });

    linkSourcePackage(project.resolve("node_modules/@auaust/engrenage"));

    return createProjectConfig({
      root: project.root,
      raw: {
        preset: "library",
        agents: {
          preferred: ["claude"],
        },
        src: {
          node: 24,
          roles: [index(), entrypoint()],
        },
        extensions: [
          {
            name: "generated-fixture",
            contributes: { "sync.targets": targets },
          },
        ],
      },
      configFile: undefined,
    });
  }

  function createGenerator(generate: (config: LoadedConfig) => Promise<void>) {
    return {
      name: "generator",
      stage: "generate",
      load() {
        return Promise.resolve(async (config: LoadedConfig) => {
          await config.resolve("structure");

          await generate(config);
        });
      },
    };
  }

  test("settles the files derived from a generated source in one sync", async () => {
    const config = createSourceProject(
      {
        "src/entry.ts": "export const root = 1;\n",
        "src/modules/a/index.ts": "export const a = 1;\n",
      },
      [
        createGenerator(({ context }) => {
          return context.filesystem.write(
            "src/modules/a/entry.ts",
            "export const a = 1;\n",
          );
        }),
      ],
    );

    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    try {
      await settleChanges(config, {
        check: false,
        failures: await runSync(config),
      });

      const { root } = config.context;

      expect(readFileSync(join(root, "src/modules/a/entry.ts"), "utf-8")).toBe(
        "export const a = 1;\n",
      );

      expect(
        JSON.parse(readFileSync(join(root, "tsconfig.json"), "utf-8"))
          .compilerOptions.paths,
      ).toEqual({
        "@fixture/project/a": ["./src/modules/a/entry.ts"],
      });

      expect(
        readFileSync(join(root, ".claude/rules/project-map/src.md"), "utf-8"),
      ).toContain("└─ modules/  #modules/…  a*");

      const copy = config.context.copy();

      expect(await runSync(copy)).toEqual([]);
      expect(await collectChanges(copy, { check: true })).toEqual([]);
    } finally {
      info.mockRestore();
    }
  });

  test("drops a domain whose last file a generator removes from the structure later targets read", async () => {
    const domains: string[][] = [];

    const config = createSourceProject(
      {
        "src/modules/a/index.ts": "export const a = 1;\n",
        "src/modules/b/index.ts": "export const b = 1;\n",
      },
      [
        createGenerator(({ context }) => {
          return context.filesystem.remove("src/modules/b/index.ts");
        }),
        {
          name: "reader",
          stage: "write",
          load() {
            return Promise.resolve(async (loaded: LoadedConfig) => {
              const { src } = await loaded.resolve("structure");

              domains.push(
                (src?.root.children ?? []).flatMap(({ children }) => {
                  return children.map(({ name }) => name);
                }),
              );
            });
          },
        },
      ],
    );

    await runSync(config, { names: ["generator", "reader"] });

    expect(domains).toEqual([["a"]]);
  });
});
