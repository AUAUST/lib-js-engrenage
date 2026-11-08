import { afterEach, describe, expect, test, vi } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { runDefinition } from "#tests/utils/runDefinition";

import eslint from "#bin/engrenage/eslint";
import engrenage from "#bin/engrenage/index";

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
  });

  test("runs without a cache", async () => {
    const project = createProject();

    await runDefinition(eslint, "src");

    expect(readRecordedArgs(project)).toEqual(["src"]);
  });

  test("passes --debug to ESLint", async () => {
    const project = createProject();

    await runDefinition(engrenage, "eslint", "--debug");

    expect(readRecordedArgs(project)).toEqual(["--debug"]);
  });
});
