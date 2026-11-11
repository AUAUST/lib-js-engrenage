import { execFile } from "node:child_process";
import { cpSync, mkdirSync, symlinkSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { describe, expect, test } from "vitest";

import { createRolePreset, entry } from "@auaust/engrenage/roles";
import { entries } from "@auaust/toolkit/object";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getExecutable } from "#tests/utils/getExecutable";
import { getFixture } from "#tests/utils/getFixture";
import { renderCodeRoles } from "#tests/utils/renderCodeRoles";

const run = promisify(execFile);

const packageName = "@fixtures/engrenage-extension";

const rule = `${packageName}/agents/rules/fixture-rule.md`;

function fromRepository(path: string): string {
  return fileURLToPath(new URL(`../../../../${path}`, import.meta.url));
}

function createExtensionProject(
  config: readonly string[] = [],
  files: Readonly<Record<string, string>> = {},
) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({ name: "consumer", type: "module" }),
    "engrenage.config.ts": [
      `import extension from "${packageName}";`,
      "",
      "export default {",
      "  extensions: [extension],",
      '  agents: { preferred: ["claude"] },',
      ...config,
      "};",
      "",
    ].join("\n"),
    ".claude/rules/fixture-rule.md": `<!-- @reference ${rule} -->\n<!-- @end -->\n`,
    ...files,
  });

  cpSync(
    getFixture("packages/extension"),
    project.resolve("packages/extension"),
    {
      recursive: true,
    },
  );

  const links = {
    "@auaust/engrenage": fromRepository(""),
    "@types/node": fromRepository("node_modules/@types/node"),
    "valibot": fromRepository("node_modules/valibot"),
    [packageName]: project.resolve("packages/extension"),
  };

  for (const [name, target] of entries(links)) {
    const link = project.resolve(`node_modules/${name}`);

    mkdirSync(dirname(link), { recursive: true });
    symlinkSync(target, link);
  }

  return project;
}

describe("an extension package importing only the public entry", () => {
  test(
    "type-checks its typed key, file resource and sync target",
    { timeout: binaryTimeout },
    async () => {
      const { resolve } = createExtensionProject();

      const checked = run(process.execPath, [
        fromRepository("node_modules/typescript/bin/tsc"),
        "--project",
        resolve("packages/extension/tsconfig.json"),
      ]).catch((error: unknown) => {
        throw new Error(String((error as { stdout?: string }).stdout ?? error));
      });

      await expect(checked).resolves.toBeDefined();
    },
  );

  test(
    "ships an agent fragment that reaches engrenage sync agents",
    { timeout: binaryTimeout },
    async () => {
      const { root, read } = createExtensionProject();

      await run(process.execPath, [getExecutable(), "sync", "agents"], {
        cwd: root,
      });

      const synced = read(".claude/rules/fixture-rule.md");

      expect(synced).toContain("paths:\n  - fixture/**");
      expect(synced).toContain("Shipped by the fixture extension.");
    },
  );

  test(
    "lists the public domains of src with their collected roles from the resolved structure",
    { timeout: binaryTimeout },
    async () => {
      const collected = createRolePreset({
        name: "collected",
        file: "collected.ts",
        exports: "default",
        public: true,
        collected: true,
      });

      const roles = renderCodeRoles(entry(), collected());

      const { root, read } = createExtensionProject(
        [
          '  preset: "library",',
          `  src: { roles: ${roles}, structure: { layers: ["project"] } },`,
        ],
        {
          "src/project/feature/index.ts": "export const feature = 1;\n",
          "src/project/feature/entry.ts": 'export { feature } from "./index.ts";\n',
          "src/project/feature/collected.ts": "export default 1;\n",
          "src/project/other/index.ts": "export const other = 1;\n",
        },
      );

      await run(
        process.execPath,
        [getExecutable(), "sync", "fixture-structure"],
        {
          cwd: root,
        },
      );

      expect(JSON.parse(read("fixture-output/domains.json"))).toEqual([
        { path: "src/project/feature", roles: ["collected"] },
      ]);
    },
  );
});
