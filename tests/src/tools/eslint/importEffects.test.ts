import { ESLint } from "eslint";
import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage";
import { createEslintConfig } from "@auaust/engrenage/eslint";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

async function createLinter({
  effects = "",
  define = "",
}: { effects?: string; define?: string } = {}) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({
      name: "library",
      type: "module",
      imports: {
        "#foundation/*": "./src/foundation/*.ts",
        "#project/*": "./src/project/*.ts",
      },
    }),
    "engrenage.config.ts": `export default { preset: "library", roles: { effects: { ${effects} }, define: { operations: { exports: "named-match", effects: "effectful" }, ${define} } }, src: { namespaces: { ".": { layers: ["foundation", "project"] } } } };\n`,
    "tsconfig.json": JSON.stringify({
      compilerOptions: {
        module: "nodenext",
        moduleResolution: "nodenext",
        allowImportingTsExtensions: true,
        strict: true,
        types: ["node"],
        noEmit: true,
      },
      include: ["src"],
    }),
    "node_modules/@types/node/package.json": JSON.stringify({
      name: "@types/node",
      version: "1.0.0",
      types: "index.d.ts",
    }),
    "node_modules/@types/node/index.d.ts": [
      'declare module "node:fs" { export const readFileSync: number; }',
      'declare module "node:path" { export const join: number; }',
    ].join("\n"),
    "node_modules/my-db/package.json": JSON.stringify({
      name: "my-db",
      version: "1.0.0",
      types: "index.d.ts",
    }),
    "node_modules/my-db/index.d.ts": "export declare const connect: number;\n",
    "node_modules/valibot/package.json": JSON.stringify({
      name: "valibot",
      version: "1.0.0",
      types: "index.d.ts",
    }),
    "node_modules/valibot/index.d.ts": "export declare const string: number;\n",
    "src/foundation/base/index.ts":
      'export { helper } from "#foundation/base/utils/helper";\nexport { act } from "#foundation/base/operations/act";\n',
    "src/foundation/base/utils/helper.ts": "export const helper = 1;\n",
    "src/foundation/base/operations/act.ts": "export const act = 1;\n",
    "src/project/feature/index.ts": "export {};\n",
    "src/project/feature/utils/own.ts": "export const own = 1;\n",
    "src/project/feature/logging/trace.ts": "export const trace = 1;\n",
    "src/project/feature/constants.ts": "export const value = 1;\n",
  });

  const eslint = new ESLint({
    cwd: project.root,
    overrideConfigFile: true,
    overrideConfig: createEslintConfig(await loadConfig(project.root)),
  });

  return async (filePath: string, source: string) => {
    const [result] = await eslint.lintText(source, {
      filePath: project.resolve(filePath),
    });

    return (result?.messages ?? [])
      .filter(({ ruleId }) => ruleId === "auaust/import-effects")
      .map(({ message }) => message);
  };
}

const utility = "src/project/feature/utils/own.ts";
const constants = "src/project/feature/constants.ts";

function importing(specifier: string, name: string) {
  return `import { ${name} } from "${specifier}";\n\nexport const value = ${name};\n`;
}

describe("import effects", () => {
  test("follow bindings through a lower layer's index.ts and rank node builtins", async () => {
    const lint = await createLinter();

    expect(
      await lint(utility, importing("#foundation/base/index", "helper")),
    ).toEqual([]);

    const [message] = await lint(
      utility,
      importing("#foundation/base/index", "act"),
    );

    expect(message).toContain("confined");
    expect(message).toContain("effectful");

    expect(await lint(utility, importing("node:path", "join"))).toEqual([]);

    expect(
      await lint(utility, importing("node:fs", "readFileSync")),
    ).toHaveLength(1);
  });

  test("order levels by index, accept inserted levels and reject misplaced defaults", async () => {
    const lint = await createLinter();

    expect(
      await lint(constants, importing("#project/feature/utils/own", "own")),
    ).toHaveLength(1);

    const inserted = await createLinter({
      effects: 'levels: ["pure", "logging", "confined", "effectful"]',
      define:
        'logging: { exports: "named-match", effects: "logging", nesting: 0 }',
    });

    const trace = importing("#project/feature/logging/trace", "trace");

    expect(await inserted(utility, trace)).toEqual([]);
    expect(await inserted(constants, trace)).toHaveLength(1);

    await expect(
      createLinter({ effects: 'levels: ["confined", "pure", "effectful"]' }),
    ).rejects.toThrow("effect levels");
  });

  test("rank external modules by function, with an opt-in fallback", async () => {
    const ranked = await createLinter({
      effects:
        'modules: (specifier) => specifier === "my-db" ? "effectful" : undefined',
    });

    expect(await ranked(utility, importing("my-db", "connect"))).toHaveLength(
      1,
    );

    expect(
      await ranked(utility, importing("node:fs", "readFileSync")),
    ).toHaveLength(1);

    const open = await createLinter();

    expect(await open(utility, importing("valibot", "string"))).toEqual([]);

    const strict = await createLinter({ effects: 'fallback: "effectful"' });

    expect(await strict(utility, importing("valibot", "string"))).toHaveLength(
      1,
    );

    const listed = await createLinter({
      effects: 'fallback: "effectful", modules: { valibot: "pure" }',
    });

    expect(await listed(utility, importing("valibot", "string"))).toEqual([]);
  });
});
