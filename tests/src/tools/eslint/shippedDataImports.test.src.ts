import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { ESLint } from "eslint";
import { expect, test } from "vitest";

import { filter, map } from "@auaust/toolkit/array";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createEslintConfig } from "#tools/eslint/operations/createEslintConfig";

test("keeps scripts and tests from importing engrenage's shipped data", async () => {
  const root = fileURLToPath(new URL("../../../../", import.meta.url));

  const eslint = new ESLint({
    cwd: root,
    overrideConfigFile: true,
    overrideConfig: await createEslintConfig(await loadConfig(root), {
      typeAware: false,
    }),
  });

  for (const file of [
    "scripts/codegen/value.ts",
    "tests/src/value.test.src.ts",
  ]) {
    const specifier = relative(dirname(file), "data/tsconfig/base.json");

    const [result] = await eslint.lintText(
      `import value from "${specifier}";\n\nexport { value };\n`,
      { filePath: join(root, file) },
    );

    const ruleIds = map(result?.messages ?? [], ({ ruleId }) => ruleId);

    expect(
      filter(ruleIds, (ruleId) => ruleId === "auaust/import-environments"),
    ).toEqual(["auaust/import-environments"]);
  }
});
