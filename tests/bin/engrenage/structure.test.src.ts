import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";

import structure from "#bin/engrenage/actions/structure";

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

describe("engrenage structure", () => {
  test("prints each environment as the project map's tree, with classification details", async () => {
    createProject(
      '{ src: { strictness: "loose", structure: { domains: { feature: { purpose: "A configured feature." } } } } }',
    );

    await structure({ check: false });

    expect(vi.mocked(console.info).mock.calls.flat().slice(0, 3)).toStrictEqual(
      [
        "src/  [config]  (loose)",
        "├─ feature  #feature/…  domain  [config]  A configured feature.",
        "└─ mystery  #mystery/…  domain  [inferred]",
      ],
    );
  });

  test("warns on a domain without a purpose without failing the check", async () => {
    createProject('{ src: { strictness: "loose" } }');

    await structure({ check: true });

    expect(console.warn).toHaveBeenCalledWith(
      "src/feature has no purpose: set one on its `domains` entry.",
    );

    expect(process.exitCode).toBeUndefined();
  });

  test("does not warn on a domain with a purpose", async () => {
    createProject(
      '{ src: { strictness: "loose", structure: { domains: { feature: { purpose: "A configured feature." }, mystery: { purpose: "Additional fixture files." } } } } }',
    );

    await structure({ check: true });

    expect(console.warn).not.toHaveBeenCalled();
  });

  test("fails the check on an unclassified directory of a strict environment", async () => {
    createProject("{}");

    await structure({ check: true });

    expect(process.exitCode).toBe(1);
  });

  test("passes the check on the same directory under loose", async () => {
    createProject('{ src: { strictness: "loose" } }');

    await structure({ check: true });

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

      await structure({ check: true });

      expect(process.exitCode).toBe(exitCode);
    },
  );

  test("fails the check on a mirror directory lacking its counterpart", async () => {
    createProject('{ src: { strictness: "loose" }, tests: { mirror: true } }', {
      "tests/src/feature/x.test.ts": "",
      "tests/src/ghost/y.test.ts": "",
    });

    await structure({ check: true });

    expect(process.exitCode).toBe(1);
  });
});
