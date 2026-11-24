import { describe, expect, test } from "vitest";

import { createProjectLinter } from "#tests/utils/createProjectLinter";

const typeImport = "auaust/consistent-type-imports";

const source = 'import { Shape } from "./shape.ts";\n\nexport type Copy = Shape;\n';

describe("scope rules", () => {
  test("apply a workspace's lint options to its files only", async () => {
    const { lint } = await createProjectLinter(
      `export default { environments: { src: { execution: { globals: "node", syntax: 24 } } }, typescript: { verbatimModuleSyntax: false } };\n`,
      {
        "src/shape.ts": "export type Shape = 1;\n",
        "theme/.workspace.json": JSON.stringify({
          typescript: { verbatimModuleSyntax: true },
        }),
        "theme/package.json": JSON.stringify({ name: "theme" }),
        "theme/src/shape.ts": "export type Shape = 1;\n",
      },
    );

    expect(await lint("src/copy.ts", typeImport, source)).toEqual([]);

    expect(await lint("theme/src/copy.ts", typeImport, source)).toHaveLength(1);
  });
});
