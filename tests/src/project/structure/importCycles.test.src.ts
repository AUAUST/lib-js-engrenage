import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { findImportCycles } from "#project/structure/operations/findImportCycles";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

async function cyclesOf(files: Record<string, string>) {
  const project = createTemporaryProject({
    "package.json": '{ "name": "project", "type": "module" }',
    "tsconfig.json": "{}",
    "engrenage.config.ts": "export default { src: { node: 24 } };\n",
    "src/index.ts": "",
    ...files,
  });

  const config = await loadConfig(project.root);

  return findImportCycles({
    root: config.root,
    structure: config.structure,
    aliases: config.aliases,
  });
}

describe("findImportCycles", () => {
  test("reports the path of two peer domains importing each other's index at runtime", async () => {
    const cycles = await cyclesOf({
      "src/a/index.ts":
        'export { b } from "#src/b/index";\nexport const a = 1;\n',
      "src/b/index.ts":
        'import { a } from "#src/a/index";\nexport const b = a;\n',
    });

    expect(cycles).toEqual([
      ["src/a/index.ts", "src/b/index.ts", "src/a/index.ts"],
    ]);
  });

  test("ignores the same pair with type-only imports", async () => {
    const cycles = await cyclesOf({
      "src/a/index.ts":
        'export type { B } from "#src/b/index";\nexport type A = 1;\n',
      "src/b/index.ts":
        'import type { A } from "#src/a/index";\nexport type B = A;\n',
    });

    expect(cycles).toEqual([]);
  });

  test("keeps an import whose specifiers are all inline type", async () => {
    const cycles = await cyclesOf({
      "src/a.ts": 'import { type B } from "./b";\nexport type A = B;\n',
      "src/b.ts": 'import { a } from "./a";\nexport type B = typeof a;\n',
    });

    expect(cycles).toEqual([["src/a.ts", "src/b.ts", "src/a.ts"]]);
  });

  test("reports a sub-domain reaching its ancestor's module that imports the sub-domain's index", async () => {
    const cycles = await cyclesOf({
      "src/feature/index.ts": 'export { helper } from "./utils/helper";\n',
      "src/feature/utils/helper.ts":
        'import { child } from "../sub/index";\nexport const helper = child;\n',
      "src/feature/sub/index.ts":
        'import { helper } from "../utils/helper";\nexport const child = helper;\n',
    });

    expect(cycles).toEqual([
      [
        "src/feature/sub/index.ts",
        "src/feature/utils/helper.ts",
        "src/feature/sub/index.ts",
      ],
    ]);
  });
});
