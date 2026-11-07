import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { structure } from "#bin/engrenage/structure";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { runCommand } from "#tests/utils/runCommand";

const files = {
  "package.json": '{ "name": "project", "type": "module" }',
  "src/index.ts": "",
  "src/feature/index.ts": "",
  "src/mystery/a.ts": "",
};

function createProject(config: string, extra: Record<string, string> = {}) {
  const project = createTemporaryProject({
    ...files,
    ...extra,
    "engrenage.config.ts": `export default ${config};\n`,
  });

  mockCwd(project.root);
}

beforeEach(() => {
  vi.spyOn(console, "info").mockImplementation(() => {});
  process.exitCode = undefined;
});

afterEach(() => {
  vi.restoreAllMocks();
  process.exitCode = undefined;
});

// @debt the structure output is untested: asserting printed lines enforces a display, and a useful way to test what it reports is still to be found
describe("engrenage structure", () => {
  test("fails the check on an unclassified directory of a strict environment", async () => {
    createProject("{}");

    await runCommand(structure, "--check");

    expect(process.exitCode).toBe(1);
  });

  test("passes the check on the same directory under loose", async () => {
    createProject('{ src: { strictness: "loose" } }');

    await runCommand(structure, "--check");

    expect(process.exitCode).toBeUndefined();
  });

  test("fails the check on a mirror directory lacking its counterpart", async () => {
    createProject('{ src: { strictness: "loose" }, tests: { mirror: true } }', {
      "tests/src/feature/x.test.ts": "",
      "tests/src/ghost/y.test.ts": "",
    });

    await runCommand(structure, "--check");

    expect(process.exitCode).toBe(1);
  });
});
