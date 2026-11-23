import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage/extensions";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

function createProject(config: string) {
  return createTemporaryProject({
    "package.json": '{ "name": "project", "type": "module" }',
    "engrenage.config.ts": `export default ${config};\n`,
  });
}

async function resolveRuntime(config: string, environment: string) {
  const loaded = await loadConfig(createProject(config).root);

  const execution = await loaded.resolve("environments.execution");

  return execution[environment]?.runtime;
}

const baseline = '{ environments: { src: { execution: { syntax: "2026-10" } } } }';

describe("runtime", () => {
  test("derives the minimums of the 2026-10 snapshot", async () => {
    expect(await resolveRuntime(baseline, "src")).toMatchObject({
      kind: "baseline",
      snapshot: "2026-10",
      browsers: { chrome: "123" },
      node: 22,
    });
  });

  test.each(["tests", "scripts", "tooling", "bin"])(
    "runs %s on runtime.node",
    async (environment) => {
      expect(await resolveRuntime(baseline, environment)).toEqual({
        kind: "node",
        major: 24,
      });
    },
  );

  test("tunes a Node registration's major", async () => {
    expect(
      await resolveRuntime(
        "{ environments: { bin: { execution: { syntax: 22 } } } }",
        "bin",
      ),
    ).toEqual({ kind: "node", major: 22 });

    expect(
      await resolveRuntime(
        '{ environments: { src: { execution: { globals: "node", syntax: 24 } } } }',
        "src",
      ),
    ).toEqual({ kind: "node", major: 24 });
  });

  test("fails on a baseline snapshot beside Node globals", async () => {
    await expect(
      resolveRuntime(
        '{ environments: { src: { execution: { globals: "node", syntax: "2026-10" } } } }',
        "src",
      ),
    ).rejects.toThrow("set it to a Node major");
  });

  test("names the earliest accepted snapshot for an unsupported one", async () => {
    await expect(
      resolveRuntime(
        '{ environments: { src: { execution: { syntax: "2020-01" } } } }',
        "src",
      ),
    ).rejects.toThrow("the earliest accepted snapshot is 2022-08");
  });

  test("fails on a Node major that node-releases does not list", async () => {
    await expect(
      resolveRuntime(
        '{ environments: { src: { execution: { globals: "node", syntax: 999 } } } }',
        "src",
      ),
    ).rejects.toThrow("node-releases does not list");
  });
});
