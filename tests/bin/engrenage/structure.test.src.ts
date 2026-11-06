import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { structure } from "#bin/engrenage/structure";
import { index } from "#project/roles/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { runCommand } from "#tests/utils/runCommand";

const files = {
  "package.json": '{ "name": "project", "type": "module" }',
  "src/index.ts": "",
  "src/feature/index.ts": "",
  "src/feature/stray.ts": "",
  "src/zone/base/index.ts": "",
  "src/zone/top/index.ts": "",
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

function printed(): string[] {
  return vi.mocked(console.info).mock.calls.map(([line]) => String(line));
}

beforeEach(() => {
  vi.spyOn(console, "info").mockImplementation(() => {});
  process.exitCode = undefined;
});

afterEach(() => {
  vi.restoreAllMocks();
  process.exitCode = undefined;
});

describe("engrenage structure", () => {
  test("fails the check on an unclassified directory of a strict environment", async () => {
    createProject("{}");

    await runCommand(structure, "--check");

    expect(printed()).toContain("  src/mystery  unclassified  [inferred]");
    expect(process.exitCode).toBe(1);
  });

  test("reports the same directory without failing under loose", async () => {
    createProject('{ src: { strictness: "loose" } }');

    await runCommand(structure, "--check");

    expect(printed()).toContain("  src/mystery  domain (internal)  [inferred]");
    expect(process.exitCode).toBeUndefined();
  });

  test("prints namespace layers, sources and files outside any role", async () => {
    createProject(
      `{ src: { roles: ${JSON.stringify([index()])}, namespaces: { zone: { layers: ["base", "*", "top"] } } } }`,
    );

    await runCommand(structure);

    expect(printed()).toEqual(
      expect.arrayContaining([
        "src (strict)",
        "  src/zone  namespace (layers: base < * < top)  [config]",
        "    src/zone/base  domain (internal)  [inferred]",
        "  src/feature  domain (internal)  [inferred]",
        "    src/feature/stray.ts  unclassified (file outside any role)",
      ]),
    );

    expect(process.exitCode).toBeUndefined();
  });

  test("prints the reason of a mirror directory lacking its counterpart", async () => {
    createProject('{ tests: { layout: "mirror" } }', {
      "tests/src/feature/x.test.ts": "",
      "tests/src/ghost/y.test.ts": "",
    });

    await runCommand(structure, "--check");

    expect(printed()).toContain(
      "    tests/src/ghost  unclassified (missing counterpart)  [inferred]",
    );

    expect(process.exitCode).toBe(1);
  });
});
