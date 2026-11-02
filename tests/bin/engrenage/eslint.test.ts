import { afterEach, describe, expect, test, vi } from "vitest";

import { eslint } from "#bin/engrenage/eslint";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { mockCwd } from "#tests/helpers/mockCwd";
import { runCommand } from "#tests/helpers/runCommand";

function createProject() {
  const project = createTemporaryProject({
    "package.json": '{"name":"project","type":"module"}',
    "engrenage.config.ts": "export default {};\n",
    "node_modules/eslint/package.json": JSON.stringify({
      name: "eslint",
      bin: { eslint: "./bin.mjs" },
    }),
    "node_modules/eslint/bin.mjs": [
      'import { writeFileSync } from "node:fs";',
      'writeFileSync(new URL("./args.json", import.meta.url), JSON.stringify(process.argv.slice(2)));',
      "",
    ].join("\n"),
  });

  mockCwd(project.root);

  vi.spyOn(console, "info").mockImplementation(() => {});

  return project;
}

function readRecordedArgs(project: ReturnType<typeof createProject>): unknown {
  return JSON.parse(project.read("node_modules/eslint/args.json"));
}

describe("engrenage eslint", () => {
  afterEach(() => {
    vi.restoreAllMocks();

    process.exitCode = undefined;
  });

  test("caches results in node_modules", async () => {
    const project = createProject();

    await runCommand(eslint.eslint, "src");

    expect(readRecordedArgs(project)).toEqual([
      "src",
      "--cache",
      "--cache-location",
      project.resolve("node_modules/.cache/eslint"),
    ]);
  });

  test("runs without the cache when --no-cache is passed", async () => {
    const project = createProject();

    await runCommand(eslint["eslint:fix"], "--no-cache");

    expect(readRecordedArgs(project)).toEqual(["--no-cache", "--fix"]);
  });
});
