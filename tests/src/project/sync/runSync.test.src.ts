import { describe, expect, test } from "vitest";

import { createProjectConfig } from "#project/config/index";
import { runSync, type SyncDone } from "#project/sync/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

function createTarget(
  name: string,
  runs: string[],
  edges: { reads?: readonly string[]; produces?: readonly string[] } = {},
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
    const { extension } = createFixture(
      createTarget("orphan", [], { reads: ["missing"] }),
    );

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
});
