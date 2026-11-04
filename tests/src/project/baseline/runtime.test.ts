import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage/config";

import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";

function createProject(config: string) {
  return createTemporaryProject({
    "package.json": '{ "name": "project", "type": "module" }',
    "engrenage.config.ts": `export default ${config};\n`,
  });
}

describe("runtime", () => {
  test("derives the minimums of the 2026-10 snapshot", async () => {
    const config = await loadConfig(
      createProject('{ src: { baseline: "2026-10" } }').root,
    );

    expect(config.src.runtime).toMatchObject({
      kind: "baseline",
      snapshot: "2026-10",
      browsers: { chrome: "123" },
      node: 22,
    });
  });

  test("runs tests, scripts and tooling on runtime.node", async () => {
    const config = await loadConfig(
      createProject('{ src: { baseline: "2026-10" } }').root,
    );

    expect(config.runtime.node).toBe(24);
    expect(config.tests.runtime).toEqual({ kind: "node", major: 24 });
    expect(config.scripts.runtime).toEqual({ kind: "node", major: 24 });
    expect(config.tooling.runtime).toEqual({ kind: "node", major: 24 });
  });

  test("defaults bin.node to runtime.node", async () => {
    const config = await loadConfig(
      createProject('{ src: { baseline: "2026-10" } }').root,
    );

    expect(config.bin.runtime).toEqual({ kind: "node", major: 24 });

    const configured = await loadConfig(
      createProject("{ bin: { node: 22 } }").root,
    );

    expect(configured.bin.runtime).toEqual({ kind: "node", major: 22 });
  });

  test("resolves src.node to a node runtime", async () => {
    const config = await loadConfig(
      createProject("{ src: { node: 24 } }").root,
    );

    expect(config.src.runtime).toEqual({ kind: "node", major: 24 });
  });

  test("fails when src sets both baseline and node", async () => {
    const config = await loadConfig(
      createProject('{ src: { baseline: "2026-10", node: 24 } }').root,
    );

    expect(() => config.src.runtime).toThrow("mutually exclusive");
  });

  test("names the earliest accepted snapshot for an unsupported one", async () => {
    const config = await loadConfig(
      createProject('{ src: { baseline: "2020-01" } }').root,
    );

    expect(() => config.src.runtime).toThrow(
      "the earliest accepted snapshot is 2022-08",
    );
  });

  test("fails on a Node major that node-releases does not list", async () => {
    const config = await loadConfig(
      createProject("{ src: { node: 999 } }").root,
    );

    expect(() => config.src.runtime).toThrow("node-releases does not list");
  });
});
