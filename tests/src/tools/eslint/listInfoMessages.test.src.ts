import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { listInfoMessages } from "#tools/eslint/operations/listInfoMessages";

function sourcePath(path: string): string {
  return fileURLToPath(new URL(`../../../../${path}`, import.meta.url));
}

describe("listInfoMessages", () => {
  test(
    "lists info messages without a fix",
    async () => {
      const project = createTemporaryProject({
        "package.json": JSON.stringify({
          type: "module",
          devDependencies: { eslint: "*" },
        }),
        "tsconfig.json": JSON.stringify({
          extends: sourcePath("data/tsconfig/base.json"),
          include: ["**/*.ts"],
        }),
        "engrenage.config.ts": "export default {};\n",
        "eslint.config.ts": `import { defineEslintConfig } from ${JSON.stringify(sourcePath("src/tools/eslint/index.ts"))};\n\nexport default defineEslintConfig();\n`,
        "src/edited.ts": "const leftover = 1;\n\nconst snake_case = 2;\n\nexport const doubled = snake_case * 2;\n",
      });

      mockCwd(project.root);

      const messages = await listInfoMessages(
        await loadConfig(project.root),
        project.resolve("src/edited.ts"),
      );

      expect(messages).toEqual([
        {
          line: 1,
          column: 7,
          ruleId: "auaust/no-unused-vars",
          message: "'leftover' is assigned a value but never used.",
        },
      ]);
    },
    binaryTimeout,
  );
});
