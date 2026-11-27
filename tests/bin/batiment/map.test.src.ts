import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { runDefinition } from "#tests/utils/runDefinition";

import batiment from "#bin/batiment/index";

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
  process.exitCode = undefined;
});

afterEach(() => {
  vi.restoreAllMocks();
  process.exitCode = undefined;
});

describe("batiment map", () => {
  test("prints each environment as the project map's tree, with classification details", async () => {
    createProject(
      '{ src: { strictness: "loose", structure: { domains: { feature: { purpose: "A configured feature." } } } } }',
    );

    const { messages } = await runDefinition(batiment, "map");

    expect(messages.slice(0, 3)).toStrictEqual([
      {
        level: "log",
        text: "src/  [config]  (loose)",
        data: undefined,
      },
      {
        level: "log",
        text: "├─ feature  #feature/…  domain  [config]  A configured feature.",
        data: undefined,
      },
      {
        level: "log",
        text: "└─ mystery  #mystery/…  domain  [inferred]",
        data: undefined,
      },
    ]);
  });

  test("warns on a domain without a purpose without failing the check", async () => {
    createProject('{ src: { strictness: "loose" } }');

    const { warnings } = await runDefinition(batiment, "map", "--check");

    expect(warnings).toContain(
      "src/feature has no purpose: set one on its `domains` entry.",
    );

    expect(process.exitCode).toBeUndefined();
  });

  test("states the report's facts and diagnostics as data", async () => {
    createProject('{ src: { strictness: "loose" } }');

    const { entries } = await runDefinition(batiment, "map");

    const data = entries.find((entry) => {
      return entry.kind === "data";
    });

    expect(data?.value).toMatchObject({
      facts: {
        structure: {
          src: { name: "src" },
        },
        cycles: [],
      },
      diagnostics: expect.arrayContaining(
        ["src/feature", "src/mystery"].map((path) => {
          return expect.objectContaining({
            severity: "warning",
            code: "missing-purpose",
            path,
          });
        }),
      ),
    });
  });

  test("does not warn on a domain with a purpose", async () => {
    createProject(
      '{ src: { strictness: "loose", structure: { purpose: "The code.", domains: { feature: { purpose: "A configured feature." }, mystery: { purpose: "Additional fixture files." } } } }, tooling: { structure: { purpose: "The config." } } }',
    );

    const { warnings } = await runDefinition(batiment, "map", "--check");

    expect(warnings).toStrictEqual([]);
  });

  test("fails the check on an unclassified directory of a strict environment", async () => {
    createProject("{}");

    await runDefinition(batiment, "map", "--check");

    expect(process.exitCode).toBe(1);
  });

  test("passes the check on the same directory under loose", async () => {
    createProject('{ src: { strictness: "loose" } }');

    await runDefinition(batiment, "map", "--check");

    expect(process.exitCode).toBeUndefined();
  });

  test.each([
    ["fails", "beside the root group's index", { "scripts/bar.ts": "" }, 1],
    ["fails", "beside a nested group's index", { "scripts/bar/baz.ts": "" }, 1],
    [
      "passes",
      "in a group's actions",
      { "scripts/bar/actions/baz.ts": "" },
      undefined,
    ],
  ] as const)(
    "%s the check on a module %s",
    async (_verdict, _place, extra, exitCode) => {
      createProject('{ src: { strictness: "loose" } }', {
        "scripts/index.ts": "",
        "scripts/bar/index.ts": "",
        ...extra,
      });

      await runDefinition(batiment, "map", "--check");

      expect(process.exitCode).toBe(exitCode);
    },
  );

  test("fails the check on a mirror directory lacking its counterpart", async () => {
    createProject('{ src: { strictness: "loose" }, tests: { mirror: true } }', {
      "tests/src/feature/x.test.ts": "",
      "tests/src/ghost/y.test.ts": "",
    });

    await runDefinition(batiment, "map", "--check");

    expect(process.exitCode).toBe(1);
  });
});
