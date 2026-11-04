import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, test } from "vitest";

import { createEmittedManifest } from "#project/build/operations/createEmittedManifest";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

function createBuild() {
  const project = createTemporaryProject({
    "dist/host.txt": "host",
  });

  const outDir = project.resolve("dist");
  const manifest = project.resolve("cache/emitted.json");

  function build(emitted: string[], options?: { fail?: boolean }) {
    const recorder = createEmittedManifest({ manifest, outDir });

    recorder.removePrevious();

    mkdirSync(outDir, { recursive: true });

    for (const file of emitted) {
      writeFileSync(join(outDir, file), file);
    }

    recorder.add(emitted);

    if (options?.fail === true) {
      recorder.fail();
    }

    recorder.write();
  }

  return {
    project,
    outDir,
    manifest,
    build,
  };
}

describe("createEmittedManifest", () => {
  test("removes only the files the previous build emitted and no longer produces", () => {
    const { outDir, build } = createBuild();

    build(["a.mjs", "b.mjs"]);
    build(["a.mjs"]);

    expect(existsSync(join(outDir, "host.txt"))).toBe(true);
    expect(existsSync(join(outDir, "a.mjs"))).toBe(true);
    expect(existsSync(join(outDir, "b.mjs"))).toBe(false);
  });

  test("removes nothing without a manifest and writes none after a failed build", () => {
    const { outDir, manifest, build } = createBuild();

    build(["a.mjs"], { fail: true });

    expect(existsSync(manifest)).toBe(false);

    build(["b.mjs"]);

    expect(existsSync(join(outDir, "a.mjs"))).toBe(true);
    expect(existsSync(join(outDir, "host.txt"))).toBe(true);
  });
});
