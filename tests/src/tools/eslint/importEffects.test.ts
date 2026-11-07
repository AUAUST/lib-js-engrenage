import { ESLint } from "eslint";
import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage/config";
import { createEslintConfig } from "@auaust/engrenage/eslint";
import { createRolePreset, entry, type Role } from "@auaust/engrenage/roles";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { renderCodeRoles } from "#tests/utils/renderCodeRoles";

const operations = createRolePreset({
  name: "operations",
  exports: "named-match",
  effects: "effectful",
});

async function createLinter({
  effects = "",
  roles = [],
}: { effects?: string; roles?: readonly Role[] } = {}) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({
      name: "library",
      type: "module",
      imports: {
        "#foundation/*": "./src/foundation/*.ts",
        "#project/*": "./src/project/*.ts",
      },
    }),
    "engrenage.config.ts": `export default { preset: "library", structure: { effects: { ${effects} } }, src: { roles: ${renderCodeRoles(entry(), operations(), ...roles)}, namespaces: { ".": { layers: ["foundation", "project"] } } } };\n`,
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
      'declare module "node:fs" { export const writeFileSync: number; }',
      'declare module "node:path" { export const join: number; }',
    ].join("\n"),
    "node_modules/my-db/package.json": JSON.stringify({
      name: "my-db",
      version: "1.0.0",
      types: "index.d.ts",
    }),
    "node_modules/my-db/index.d.ts":
      "export declare const connect: number;\nexport declare const readFileSync: number;\nexport default connect;\n",
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
    "src/project/feature/utils/index.ts": "export const index = 1;\n",
    "src/project/feature/logging/trace.ts": "export const trace = 1;\n",
    "src/project/feature/observing/read.ts": "export const read = 1;\n",
    "src/project/feature/constants.ts": "export const value = 1;\n",
    "src/project/feature/config/featureSchema.ts": "export const value = 1;\n",
    "src/project/feature/config/defineFeatureConfig.ts":
      "export const value = 1;\n",
  });

  const eslint = new ESLint({
    cwd: project.root,
    overrideConfigFile: true,
    overrideConfig: await createEslintConfig(await loadConfig(project.root)),
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

const config = createRolePreset({
  name: "config",
  effects: "confined",
  roles: [
    {
      name: "schemas",
      file: "*Schema.ts",
      effects: "confined",
    },
    {
      name: "definers",
      file: "define*Config.ts",
      effects: "effectful",
    },
  ],
});

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

  test("ranks a module named like the index file in a role without index as the role's module", async () => {
    const lint = await createLinter();

    expect(
      await lint(
        "src/project/feature/utils/index.ts",
        importing("#foundation/base/operations/act", "act"),
      ),
    ).toHaveLength(1);
  });

  test("order levels by index, accept inserted levels and reject misplaced defaults", async () => {
    const lint = await createLinter();

    expect(
      await lint(constants, importing("#project/feature/utils/own", "own")),
    ).toHaveLength(1);

    const inserted = await createLinter({
      effects:
        'levels: ["pure", "logging", "confined", "observing", "effectful"]',
      roles: [
        createRolePreset({
          name: "logging",
          exports: "named-match",
          effects: "logging",
          nesting: 0,
        })(),
      ],
    });

    const trace = importing("#project/feature/logging/trace", "trace");

    expect(await inserted(utility, trace)).toEqual([]);
    expect(await inserted(constants, trace)).toHaveLength(1);

    await expect(
      createLinter({
        effects: 'levels: ["confined", "pure", "effectful"]',
      }),
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

    expect(await open(utility, importing("my-db", "connect"))).toEqual([]);

    const strict = await createLinter({ effects: 'fallback: "effectful"' });

    expect(await strict(utility, importing("my-db", "connect"))).toHaveLength(
      1,
    );

    const listed = await createLinter({
      effects: 'fallback: "effectful", modules: { valibot: "pure" }',
    });

    expect(await listed(utility, importing("valibot", "string"))).toEqual([]);
  });

  test("ranks named, renamed, default and namespace bindings independently", async () => {
    const roles = [
      createRolePreset({
        name: "observing",
        effects: "observing",
        nesting: 0,
      })(),
    ];

    const read = "src/project/feature/observing/read.ts";

    const lint = await createLinter({ roles });

    expect(await lint(read, importing("node:fs", "readFileSync"))).toEqual([]);

    expect(
      await lint(read, importing("node:fs", "writeFileSync")),
    ).toHaveLength(1);

    expect(
      await lint(
        read,
        'import * as fs from "node:fs";\nexport const read = fs;\n',
      ),
    ).toHaveLength(1);

    const configured = await createLinter({
      roles,
      effects:
        'modules: { "my-db": { default: "effectful", symbols: { default: "pure", readFileSync: "observing" } } }',
    });

    expect(
      await configured(
        constants,
        'import value from "my-db";\nexport { value };\n',
      ),
    ).toEqual([]);

    expect(await configured(read, importing("my-db", "readFileSync"))).toEqual(
      [],
    );

    expect(
      await configured(
        read,
        'import { readFileSync as renamed } from "my-db";\nexport const read = renamed;\n',
      ),
    ).toEqual([]);

    expect(await configured(read, importing("my-db", "connect"))).toHaveLength(
      1,
    );

    expect(
      await configured(
        read,
        'import * as db from "my-db";\nexport const read = db;\n',
      ),
    ).toHaveLength(1);

    expect(
      await configured(read, 'export { readFileSync as read } from "my-db";\n'),
    ).toEqual([]);

    expect(await configured(read, 'export * from "my-db";\n')).toHaveLength(1);

    expect(
      await configured(read, 'import "my-db";\nexport const read = 1;\n'),
    ).toHaveLength(1);
  });

  test("rank a file at a role's root by the nested role its name matches", async () => {
    const lint = await createLinter({ roles: [config()] });

    const act = importing("#foundation/base/index", "act");

    expect(
      await lint("src/project/feature/config/featureSchema.ts", act),
    ).toHaveLength(1);

    expect(
      await lint("src/project/feature/config/defineFeatureConfig.ts", act),
    ).toEqual([]);
  });
});
