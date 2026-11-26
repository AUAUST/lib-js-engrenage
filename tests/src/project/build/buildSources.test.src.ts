import { rmSync } from "node:fs";

import { describe, expect, test } from "vitest";

import { checkBuildSources } from "#project/build/operations/checkBuildSources";
import { createBuildSources } from "#project/build/operations/createBuildSources";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

async function recordBuild() {
  const project = createTemporaryProject({
    "package.json": "{}\n",
    "src/a.ts": "export const a = 1;\n",
    "src/b.ts": "export const b = 2;\n",
  });

  const record = createBuildSources({
    root: project.root,
    inputs: ["package.json"],
  });

  record.add([
    project.resolve("src/a.ts"),
    project.resolve("src/b.ts"),
    "\0virtual",
    project.resolve("src/missing.d.ts"),
  ]);

  await record.write();

  return {
    project,
    check() {
      return checkBuildSources(project.root);
    },
  };
}

describe("build sources", () => {
  test("stays fresh until a consumed source changes, whatever its time", async () => {
    const { project, check } = await recordBuild();

    expect(await check()).toBe("fresh");

    project.write("src/b.ts", "export const b = 2;\n");

    expect(await check()).toBe("fresh");

    project.write("src/b.ts", "export const b = 3;\n");

    expect(await check()).toBe("stale");
  });

  test("reads a removed source as stale and a missing record as unrecorded", async () => {
    const { project, check } = await recordBuild();

    rmSync(project.resolve("src/a.ts"));

    expect(await check()).toBe("stale");

    rmSync(project.resolve(".engrenage/build-sources.json"));

    expect(await check()).toBe("unrecorded");
  });

  test("writes no record for a failed build", async () => {
    const project = createTemporaryProject({ "src/a.ts": "" });

    const record = createBuildSources({
      root: project.root,
      inputs: [],
    });

    record.fail();

    await record.write();

    expect(await checkBuildSources(project.root)).toBe("unrecorded");
  });
});
