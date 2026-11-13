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
    "src/project/feature/index.ts": 'export { exposed } from "#project/feature/utils/exposed";\nexport { local, renamed } from "#project/feature/utils/local";\nexport { bounds, upper } from "#project/feature/utils/bounds";\nexport { default as fallback } from "#project/feature/utils/fallback";\nexport type * from "#project/feature/ports/Store";\n',
    "src/project/feature/entry.ts": 'export { exposed, local, renamed, bounds, upper, fallback } from "#project/feature/index";\nexport type { Store } from "#project/feature/index";\n',
    "src/project/feature/utils/local.ts": "function local(): number {\n  return 1;\n}\n\n/**\n * Returns two.\n */\nfunction documented(): number {\n  return 2;\n}\n\nexport { local, documented as renamed };\n",
    "src/project/feature/utils/bounds.ts": "export const { bounds, limits: [upper] } = { bounds: 0, limits: [1] };\n",
    "src/project/feature/utils/fallback.ts": "const fallback = 1;\n\nexport default fallback;\n",
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

      expect(await list("src/project/feature/utils/local.ts")).toEqual([
        {
          line: 12,
          message: "Document `local`: a package entry exports it and consumers never see its source, so state the behavior its name and signature leave open.",
        },
      ]);

      expect(
        (await list("src/project/feature/utils/bounds.ts")).map(
          ({ message }) => {
            return message;
          },
        ),
      ).toEqual([
        "Document `bounds`: a package entry exports it and consumers never see its source, so state the behavior its name and signature leave open.",
        "Document `upper`: a package entry exports it and consumers never see its source, so state the behavior its name and signature leave open.",
      ]);

      expect(await list("src/project/feature/utils/fallback.ts")).toEqual([
        {
          line: 3,
          message: "Document `default`: a package entry exports it and consumers never see its source, so state the behavior its name and signature leave open.",
        },
      ]);
    },
    binaryTimeout,
  );
});
