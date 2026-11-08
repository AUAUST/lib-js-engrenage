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
  vi.spyOn(console, "warn").mockImplementation(() => {});
  process.exitCode = undefined;
});

afterEach(() => {
  vi.restoreAllMocks();
  process.exitCode = undefined;
});

// @debt the structure output is untested: asserting printed lines enforces a display, and a useful way to test what it reports is still to be found
describe("engrenage structure", () => {
  test("warns on a domain without a purpose without failing the check", async () => {
    createProject('{ src: { strictness: "loose" } }');

    await runCommand(structure, "--check");

    expect(console.warn).toHaveBeenCalledWith(
      "src/feature has no purpose: set one on its `domains` entry.",
    );

    expect(process.exitCode).toBeUndefined();
  });

  test("does not warn on a domain with a purpose", async () => {
    createProject(
      '{ src: { strictness: "loose", domains: { feature: { purpose: "A configured feature." }, mystery: { purpose: "Additional fixture files." } } } }',
    );

    await runCommand(structure, "--check");

    expect(console.warn).not.toHaveBeenCalled();
  });

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

  test.each([
    ["fails", { "scripts/bar.ts": "" }, 1],
    ["passes", {}, undefined],
  ] as const)(
    "%s the check on a module beside a command group of its name",
    async (_verdict, extra, exitCode) => {
      createProject('{ src: { strictness: "loose" } }', {
        "scripts/index.ts": "",
        "scripts/bar/index.ts": "",
        ...extra,
      });

      await runCommand(structure, "--check");

      expect(process.exitCode).toBe(exitCode);
    },
  );

  test("fails the check on a mirror directory lacking its counterpart", async () => {
    createProject('{ src: { strictness: "loose" }, tests: { mirror: true } }', {
      "tests/src/feature/x.test.ts": "",
      "tests/src/ghost/y.test.ts": "",
    });

    await runCommand(structure, "--check");

    expect(process.exitCode).toBe(1);
  });
});
