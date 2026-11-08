import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { aliasesSection, structureSection } from "#project/structure/index";
import { findImportCycles } from "#project/structure/operations/findImportCycles";
import { typescriptSection } from "#project/tsconfig/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

async function cyclesOf(files: Record<string, string>, typescript = "{}") {
  const project = createTemporaryProject({
    "package.json": '{ "name": "project", "type": "module" }',
    "tsconfig.json": "{}",
    "engrenage.config.ts": `export default { src: { node: 24 }, typescript: ${typescript} };\n`,
    "src/index.ts": "",
    ...files,
  });

  const config = await loadConfig(project.root);

  const { verbatimModuleSyntax } = await config.resolve(typescriptSection);

  return findImportCycles({
    root: config.context.root,
    structure: await config.resolve(structureSection),
    aliases: await config.resolve(aliasesSection),
    verbatimModuleSyntax,
  });
}

describe("findImportCycles", () => {
  test("reports the path of two peer domains importing each other's index at runtime", async () => {
    const cycles = await cyclesOf({
      "src/a/index.ts": 'export { b } from "#b/index";\nexport const a = 1;\n',
      "src/b/index.ts": 'import { a } from "#a/index";\nexport const b = a;\n',
    });

    expect(cycles).toEqual([
      ["src/a/index.ts", "src/b/index.ts", "src/a/index.ts"],
    ]);
  });

  test("ignores the same pair with type-only imports", async () => {
    const cycles = await cyclesOf({
      "src/a/index.ts":
        'export type { B } from "#b/index";\nexport type A = 1;\n',
      "src/b/index.ts":
        'import type { A } from "#a/index";\nexport type B = A;\n',
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

  test("counts an import used only as a type, without `import type`, as a runtime edge only under verbatimModuleSyntax", async () => {
    const files = {
      "src/a.ts": 'import { B } from "./b";\nexport type A = B;\n',
      "src/b.ts":
        'import { a } from "./a";\nexport type B = typeof a;\nexport const b = 1;\n',
    };

    expect(await cyclesOf(files, "{ verbatimModuleSyntax: false }")).toEqual(
      [],
    );

    expect(await cyclesOf(files, "{ verbatimModuleSyntax: true }")).toEqual([
      ["src/a.ts", "src/b.ts", "src/a.ts"],
    ]);
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
