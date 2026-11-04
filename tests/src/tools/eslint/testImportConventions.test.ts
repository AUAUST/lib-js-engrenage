import { ESLint } from "eslint";
import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage/config";
import { createEslintConfig } from "@auaust/engrenage/eslint";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

const publicRule = "auaust/no-internal-imports-in-public-tests";

const sourceRule = "auaust/no-package-imports-in-source-tests";

async function lintTestFile(
  filePath: string,
  source: string,
  config = "{ presets: ['library'] }",
) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({
      name: "library",
      type: "module",
      imports: {
        "#tests/*": "./tests/*.ts",
        "#*": "./src/*.ts",
      },
    }),
    "engrenage.config.ts": `export default ${config};\n`,
    "tsconfig.json": "{}",
    "src/thing.ts": "export const thing = 1;\n",
    "tests/helper.ts": "export const helper = 1;\n",
  });

  const eslint = new ESLint({
    cwd: project.root,
    overrideConfigFile: true,
    overrideConfig: createEslintConfig(await loadConfig(project.root), {
      typeAware: false,
    }),
  });

  const [result] = await eslint.lintText(source, { filePath });

  return (result?.messages ?? [])
    .map((message) => message.ruleId)
    .filter((ruleId) => {
      return ruleId === publicRule || ruleId === sourceRule;
    });
}

const internals = [
  'import { thing } from "#thing";',
  'import { thing } from "../src/thing.ts";',
  'export { thing } from "#thing";',
  'await import("#thing");',
];

describe("test variant imports", () => {
  test.each(["tests/a.test.ts", "tests/a.test.dist.ts"])(
    "%s rejects internals and accepts public entries and test helpers",
    async (filePath) => {
      for (const source of internals) {
        expect(await lintTestFile(filePath, `${source}\n`)).toEqual([
          publicRule,
        ]);
      }

      expect(
        await lintTestFile(
          filePath,
          'import { helper } from "#tests/helper";\nimport { thing } from "library/thing";\nimport { x } from "./helper.ts";\n',
        ),
      ).toEqual([]);
    },
  );

  test("a source-only test accepts internals and rejects the package name", async () => {
    const filePath = "tests/a.test.src.ts";

    for (const source of internals) {
      expect(await lintTestFile(filePath, `${source}\n`)).toEqual([]);
    }

    expect(
      await lintTestFile(
        filePath,
        'import { thing } from "library";\nimport { other } from "library/thing";\n',
      ),
    ).toEqual([sourceRule, sourceRule]);
  });

  test("applies to libraries only", async () => {
    expect(
      await lintTestFile("tests/a.test.ts", `${internals[0]}\n`, "{}"),
    ).toEqual([]);
  });
});
