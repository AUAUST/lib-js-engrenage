import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { entrypoint } from "#project/roles/index";
import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { renderCodeRoles } from "#tests/utils/renderCodeRoles";
import { listInfoMessages } from "#tools/eslint/operations/listInfoMessages";

function sourcePath(path: string): string {
  return fileURLToPath(new URL(`../../../../${path}`, import.meta.url));
}

async function createProject() {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({
      name: "library",
      type: "module",
      devDependencies: { eslint: "*" },
      imports: { "#project/*": "./src/project/*.ts" },
    }),
    "tsconfig.json": JSON.stringify({
      extends: sourcePath("data/tsconfig/base.json"),
      include: ["src"],
    }),
    "engrenage.config.ts": `export default { preset: "library", src: { roles: ${renderCodeRoles(entrypoint())}, structure: { layers: ["project"] } } };\n`,
    "eslint.config.ts": `import { defineEslintConfig } from ${JSON.stringify(sourcePath("src/tools/eslint/index.ts"))};\n\nexport default defineEslintConfig();\n`,
    "src/project/feature/index.ts": 'export { exposed } from "#project/feature/utils/exposed";\nexport type * from "#project/feature/ports/Store";\n',
    "src/project/feature/entry.ts": 'export { exposed } from "#project/feature/index";\nexport type { Store } from "#project/feature/index";\n',
    "src/project/feature/ports/Store.ts": "export interface Store {\n  /**\n   * Returns `undefined` when the key is missing.\n   */\n  get(key: string): string | undefined;\n  set(key: string, value: string): void;\n}\n",
    "src/project/feature/utils/exposed.ts": "export function exposed(): number {\n  return 1;\n}\n",
    "src/project/feature/utils/hidden.ts": "export function hidden(): number {\n  return 1;\n}\n",
  });

  mockCwd(project.root);

  const config = await loadConfig(project.root);

  return async (file: string) => {
    const messages = await listInfoMessages(config, project.resolve(file));

    return messages
      .filter(({ ruleId }) => ruleId === "auaust/documented")
      .map(({ line, message }) => {
        return { line, message };
      });
  };
}

describe("docs.documented", () => {
  test(
    "report undocumented contract members and entry exports to agents",
    async () => {
      const list = await createProject();

      expect(await list("src/project/feature/ports/Store.ts")).toEqual([
        {
          line: 6,
          message: "Document `set`: its implementations live elsewhere, so state the behavior its name and signature leave open.",
        },
      ]);

      expect(await list("src/project/feature/utils/exposed.ts")).toEqual([
        {
          line: 1,
          message: "Document `exposed`: a package entry exports it and consumers never see its source, so state the behavior its name and signature leave open.",
        },
      ]);

      expect(await list("src/project/feature/utils/hidden.ts")).toEqual([]);
    },
    binaryTimeout,
  );
});
