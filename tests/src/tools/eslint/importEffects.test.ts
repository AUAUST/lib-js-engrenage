import { ESLint } from "eslint";
import { describe, expect, test } from "vitest";

import { createEslintConfig } from "@auaust/engrenage/eslint";
import { loadConfig } from "@auaust/engrenage/extensions";
import { createRolePreset, entry, type Role } from "@auaust/engrenage/roles";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { renderCodeRoles } from "#tests/utils/renderCodeRoles";

const operations = createRolePreset({
  name: "operations",
  exports: "named-match",
  effects: { evaluation: "confined", invocation: "effectful" },
});

const observing = createRolePreset({
  name: "observing",
  exports: "named-match",
  effects: { evaluation: "confined", invocation: "observing" },
});

const bootstrap = createRolePreset({
  name: "bootstrap",
  exports: "named-match",
  effects: "effectful",
});

const handlers = createRolePreset({
  name: "handlers",
  exports: "named-match",
  effects: { evaluation: "confined", invocation: "effectful" },
});

const printing = createRolePreset({
  name: "printing",
  exports: "named-match",
  effects: "printing",
});

const computing = createRolePreset({
  name: "computing",
  exports: "named-match",
  effects: "pure",
});

async function createLinter({
  effects = "",
  environments = "",
  roles = [],
  devDependencies = {},
}: {
  effects?: string;
  environments?: string;
  roles?: readonly Role[];
  devDependencies?: Readonly<Record<string, string>>;
} = {}) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({
      name: "library",
      type: "module",
      devDependencies,
      imports: {
        "#foundation/*": "./src/foundation/*.ts",
        "#project/*": "./src/project/*.ts",
      },
    }),
    "engrenage.config.ts": `export default { preset: "library", environments: { ${environments} }, structure: { effects: { ${effects} } }, src: { roles: ${renderCodeRoles(entry(), operations(), bootstrap(), handlers(), ...roles)}, structure: { layers: ["foundation", "project"] } } };\n`,
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
      'declare module "node:fs" { export function readFileSync(): void; }',
      'declare module "node:fs" { export function writeFileSync(): void; }',
      'declare module "node:path" { export function join(): void; }',
      'declare module "node:console" { export function log(): void; }',
      'declare module "node:process" { export const env: Record<string, string | undefined>; }',
    ].join("\n"),
    "node_modules/my-db/package.json": JSON.stringify({
      name: "my-db",
      version: "1.0.0",
      types: "index.d.ts",
    }),
    "node_modules/my-db/index.d.ts": "export declare function connect(): void;\nexport declare function readFileSync(): void;\nexport default connect;\n",
    "node_modules/valibot/package.json": JSON.stringify({
      name: "valibot",
      version: "1.0.0",
      types: "index.d.ts",
    }),
    "node_modules/valibot/index.d.ts": "export declare function string(): void;\n",
    "src/foundation/base/index.ts": 'export { helper } from "#foundation/base/utils/helper";\nexport { act } from "#foundation/base/operations/act";\nexport { define } from "#foundation/base/operations/define";\n',
    "src/foundation/base/operations/define.ts": "/**\n * @confined\n */\nexport function define() {}\n",
    "src/foundation/base/entry.ts": 'export * from "#foundation/base/index";\n',
    "src/foundation/base/utils/helper.ts": "export function helper() {}\n",
    "src/foundation/base/operations/act.ts": "export function act() {}\n",
    "src/foundation/base/bootstrap/boot.ts": "export function boot() {}\n",
    "src/foundation/base/bootstrap/polyfill.ts": "Object.assign(globalThis, { polyfilled: true });\n",
    "src/project/feature/index.ts": "export {};\n",
    "src/project/feature/utils/own.ts": "export function own() {}\n",
    "src/project/feature/utils/index.ts": "export function index() {}\n",
    "src/project/feature/logging/trace.ts": "export function trace() {}\n",
    "src/project/feature/observing/read.ts": "export function read() {}\n",
    "src/project/feature/handlers/run.ts": "export function run() {}\n",
    "src/project/feature/computing/now.ts": "export function now() {}\n",
    "src/project/feature/printing/print.ts": "export function print() {}\n",
    "src/project/feature/inert/none.ts": "export {};\n",
    "src/project/feature/constants.ts": "export const value = 1;\n",
    "src/project/feature/config/featureSchema.ts": "export const value = 1;\n",
    "src/project/feature/config/defineFeatureConfig.ts": "export const value = 1;\n",
  });

  const eslint = new ESLint({
    cwd: project.root,
    overrideConfigFile: true,
    overrideConfig: await createEslintConfig(await loadConfig(project.root)),
  });

  return async (
    filePath: string,
    source: string,
    rule = "auaust/import-effects",
  ) => {
    const [result] = await eslint.lintText(source, {
      filePath: project.resolve(filePath),
    });

    return (result?.messages ?? [])
      .filter(({ ruleId }) => ruleId === rule)
      .flatMap(({ message, suggestions = [] }) => {
        return [message, ...suggestions.map(({ desc }) => `suggest: ${desc}`)];
      });
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
const handler = "src/project/feature/handlers/run.ts";

function importing(specifier: string, name: string) {
  return `import { ${name} } from "${specifier}";\n\nexport const value = ${name}();\n`;
}

function invoking(specifier: string, name: string) {
  return `import { ${name} } from "${specifier}";\n\nexport function value() {\n  return ${name}();\n}\n`;
}

const act = 'import { act } from "#foundation/base/index";\n\n';

describe("import effects", () => {
  test("charge an invocation to the position running it, and a read nothing", async () => {
    const lint = await createLinter();

    expect(
      await lint(handler, invoking("#foundation/base/index", "act")),
    ).toEqual([]);

    expect(await lint(handler, `${act}export const run = act;\n`)).toEqual([]);

    const [
      evaluated,
    ] = await lint(handler, importing("#foundation/base/index", "act"));

    expect(evaluated).toContain("`act`");
    expect(evaluated).toContain("during evaluation");
    expect(evaluated).toContain("(confined)");

    const [
      invoked,
    ] = await lint(utility, invoking("#foundation/base/index", "act"));

    expect(invoked).toContain("during invocation");
    expect(invoked).toContain("(confined)");

    expect(
      await lint(utility, importing("#foundation/base/index", "helper")),
    ).toEqual([]);
  });

  test("charge at evaluation what a local function called there runs", async () => {
    const lint = await createLinter();

    const [message, ...rest] = await lint(
      handler,
      `${act}function setup() {\n  act();\n}\n\nfunction start() {\n  setup();\n}\n\nstart();\n`,
    );

    expect(rest).toEqual([]);
    expect(message).toContain("through `start`");
    expect(message).toContain("during evaluation");

    expect(
      await lint(
        handler,
        `${act}function create() {\n  return () => {\n    act();\n  };\n}\n\nexport const run = create();\n`,
      ),
    ).toEqual([]);

    expect(
      await lint(handler, `${act}(() => {\n  act();\n})();\n`),
    ).toHaveLength(1);
  });

  test("charge static members to evaluation and instance members to invocation", async () => {
    const lint = await createLinter();

    const [message] = await lint(
      handler,
      `${act}export class Run {\n  static value = act();\n}\n`,
    );

    expect(message).toContain("during evaluation");

    const instance = `${act}export class Run {\n  value = act();\n}\n`;

    expect(await lint(handler, instance)).toEqual([]);

    expect(await lint(utility, instance)).toEqual([
      expect.stringContaining("during invocation"),
    ]);

    expect(
      await lint(handler, `${instance}\nexport const run = new Run();\n`),
    ).toEqual([expect.stringContaining("through `Run`")]);
  });

  test("charge a dynamic import by the position running it", async () => {
    const lint = await createLinter();

    const boot = "#foundation/base/bootstrap/boot";

    expect(
      await lint(
        handler,
        `export async function run() {\n  return import("${boot}");\n}\n`,
      ),
    ).toEqual([]);

    const messages = await lint(
      handler,
      `export const run = import("${boot}");\n`,
    );

    expect(messages).toEqual([
      expect.stringContaining("(effectful evaluation)"),
      expect.stringContaining("`boot`"),
    ]);

    const strict = await createLinter({ effects: 'fallback: "effectful"' });

    const loading = "export function run(name: string) {\n  return import(name);\n}\n";

    expect(await strict(handler, loading)).toEqual([]);
    expect(await strict(utility, loading)).toHaveLength(1);
    expect(await lint(utility, loading)).toEqual([]);
  });

  test("charge a barrel's evaluation ceiling and rank a namespace import's members", async () => {
    const lint = await createLinter();

    for (const specifier of [
      "#foundation/base/index",
      "#foundation/base/entry",
    ]) {
      const namespace = `import * as base from "${specifier}";\n\n`;

      expect(
        await lint(utility, `${namespace}export const run = base;\n`),
      ).toEqual([]);

      expect(
        await lint(utility, `${namespace}export const run = base.helper();\n`),
      ).toEqual([]);

      expect(
        await lint(utility, `${namespace}export const run = base.act();\n`),
      ).toEqual([expect.stringContaining("`base.act`")]);
    }
  });

  test("follow bindings through a lower layer's index.ts and rank node builtins", async () => {
    const lint = await createLinter();

    expect(await lint(utility, importing("node:path", "join"))).toEqual([]);
    expect(await lint(utility, importing("node:console", "log"))).toEqual([]);

    expect(
      await lint(utility, importing("node:fs", "readFileSync")),
    ).toHaveLength(1);

    expect(
      await lint(
        constants,
        'import { writeFileSync } from "node:fs";\n\nexport const value = writeFileSync;\n',
      ),
    ).toEqual([]);
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
    ).toHaveLength(2);

    const inserted = await createLinter({
      effects: 'levels: ["pure", { name: "logging", purpose: "Write logs." }, "printing", "confined", "observing", "effectful"]',
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
    expect(await inserted(constants, trace)).toHaveLength(2);

    await expect(
      createLinter({
        effects: 'levels: ["confined", "pure", "effectful"]',
      }),
    ).rejects.toThrow("effect levels");
  });

  test("judge against the invocation ceiling of a role stating its ceilings apart", async () => {
    const lint = await createLinter({
      roles: [observing()],
    });

    const read = "src/project/feature/observing/read.ts";

    expect(
      await lint(read, invoking("#foundation/base/index", "helper")),
    ).toEqual([]);

    const [
      message,
    ] = await lint(read, invoking("#foundation/base/index", "act"));

    expect(message).toContain("(observing)");
  });

  test("rank external modules by configured entry, with an opt-in fallback", async () => {
    const ranked = await createLinter({
      effects: 'modules: { "my-db": "effectful" }',
    });

    expect(await ranked(utility, importing("my-db", "connect"))).toHaveLength(
      1,
    );

    expect(await ranked(utility, 'import "my-db";\n')).toEqual([]);

    const evaluating = await createLinter({
      effects: 'modules: { "my-db": { level: "pure", evaluation: "effectful" } }',
    });

    expect(await evaluating(utility, 'import "my-db";\n')).toEqual([
      expect.stringContaining("(effectful evaluation)"),
    ]);

    const open = await createLinter();

    expect(await open(utility, importing("my-db", "connect"))).toEqual([]);

    const strict = await createLinter({
      effects: 'fallback: "effectful"',
    });

    expect(await strict(utility, importing("my-db", "connect"))).toHaveLength(
      2,
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
        'import * as fs from "node:fs";\nexport const read = fs.writeFileSync();\n',
      ),
    ).toHaveLength(1);

    const configured = await createLinter({
      roles,
      effects: 'modules: { "my-db": { level: "effectful", symbols: { default: "pure", readFileSync: "observing" } } }',
    });

    expect(
      await configured(
        constants,
        'import value from "my-db";\nexport const run = value();\n',
      ),
    ).toEqual([]);

    expect(await configured(read, importing("my-db", "readFileSync"))).toEqual(
      [],
    );

    expect(
      await configured(
        read,
        'import { readFileSync as renamed } from "my-db";\nexport const read = renamed();\n',
      ),
    ).toEqual([]);

    expect(await configured(read, importing("my-db", "connect"))).toHaveLength(
      1,
    );

    expect(
      await configured(
        read,
        'import * as db from "my-db";\nexport const read = db.connect();\n',
      ),
    ).toHaveLength(1);
  });

  test("charge side-effect imports and re-exports their target's evaluation, and skip unresolved specifiers", async () => {
    const lint = await createLinter();

    const boot = "#foundation/base/bootstrap/boot";

    expect(await lint(utility, `import "${boot}";\n`)).toEqual([
      expect.stringContaining(`(effectful evaluation)`),
    ]);

    expect(await lint(utility, `export * from "${boot}";\n`)).toHaveLength(1);

    expect(
      await lint(utility, `export * as ns from "${boot}";\n`),
    ).toHaveLength(1);

    expect(
      await lint(utility, `export { boot } from "${boot}";\n`),
    ).toHaveLength(1);

    expect(
      await lint(
        utility,
        'export { act } from "#foundation/base/operations/act";\n',
      ),
    ).toEqual([]);

    expect(
      await lint(
        utility,
        importing("#foundation/base/operations/missing", "act"),
      ),
    ).toEqual([]);

    expect(
      await lint(utility, 'import "#foundation/base/operations/missing";\n'),
    ).toEqual([]);
  });

  test("report a side-effect import above the evaluation ceiling, and charge an unresolved one the fallback", async () => {
    const lint = await createLinter({ effects: 'fallback: "effectful"' });

    const polyfill = 'import "#foundation/base/bootstrap/polyfill";\n';

    expect(
      await lint("src/foundation/base/bootstrap/boot.ts", polyfill),
    ).toEqual([]);

    expect(await lint(utility, polyfill)).toEqual([
      expect.stringMatching(
        /imports bootstrap .*raise the role's evaluation ceiling/,
      ),
    ]);

    expect(
      await lint(utility, 'import "#foundation/base/operations/missing";\n'),
    ).toEqual([expect.stringContaining("a module lint cannot rank")]);
  });

  test("charge nothing for the imports a Vite project's bundler erases", async () => {
    const lint = await createLinter({
      effects: 'fallback: "effectful"',
      devDependencies: { vite: "*" },
    });

    expect(
      await lint(
        utility,
        'import "./styles.css";\nimport "./theme.scss";\nimport icon from "./icon.svg?url";\n\nexport const own = icon;\n',
      ),
    ).toEqual([]);

    expect(await lint(utility, 'import "./styles.js";\n')).toHaveLength(1);
  });

  test("offer to drop a reported side-effect import whose target evaluates pure", async () => {
    const lint = await createLinter({
      effects: 'levels: [{ name: "inert", purpose: "Run nothing." }, "pure", "printing", "confined", "observing", "effectful"]',
      roles: [
        createRolePreset({
          name: "inert",
          exports: "named-match",
          effects: "inert",
          nesting: 0,
        })(),
      ],
    });

    expect(
      await lint(
        "src/project/feature/inert/none.ts",
        'import "#project/feature/constants";\n',
      ),
    ).toEqual([
      expect.stringContaining("(pure evaluation)"),
      expect.stringContaining("suggest: Drop the import"),
    ]);
  });

  test("rank a file at a role's root by the nested role its name matches", async () => {
    const lint = await createLinter({ roles: [config()] });

    const run = importing("#foundation/base/index", "act");

    expect(
      await lint("src/project/feature/config/featureSchema.ts", run),
    ).toHaveLength(1);

    expect(
      await lint("src/project/feature/config/defineFeatureConfig.ts", run),
    ).toEqual([]);
  });

  test("hold a tagged function's own body to its tag and charge its tag to invokers", async () => {
    const lint = await createLinter({
      roles: [observing()],
    });

    const read = 'import { read } from "#project/feature/observing/read";\n\n';

    expect(
      await lint(
        handler,
        `${read}/**\n * @pure\n */\nexport function value() {\n  return () => read();\n}\n`,
      ),
    ).toEqual([]);

    expect(
      await lint(
        handler,
        `${read}/**\n * @pure\n */\nexport function value() {\n  return read();\n}\n`,
      ),
    ).toEqual([
      expect.stringContaining("the level its effect doc tag declares (pure)"),
    ]);

    expect(
      await lint(handler, importing("#foundation/base/index", "define")),
    ).toEqual([]);
  });

  test("report a tag above its role's invocation ceiling", async () => {
    const lint = await createLinter();

    expect(
      await lint(
        utility,
        "/**\n * @effectful\n */\nexport const own = () => {};\n",
      ),
    ).toEqual([expect.stringContaining("tags a function or class effectful")]);

    expect(
      await lint(
        utility,
        "/**\n * @effect pure\n */\nexport function own() {}\n",
      ),
    ).toEqual([]);
  });

  test("rank the globals a module references, through host aliases too", async () => {
    const lint = await createLinter({
      environments: 'src: { execution: { globals: "node", syntax: 24 } }',
      roles: [observing(), computing()],
    });

    expect(
      await lint(
        constants,
        'export const direct = fetch("/");\nexport const aliased = globalThis.fetch("/");\n',
      ),
    ).toEqual([
      expect.stringContaining("(effectful)"),
      expect.stringContaining("`globalThis.fetch`"),
    ]);

    const reading = "src/project/feature/observing/read.ts";

    expect(
      await lint(
        reading,
        "export function read() {\n  return process.env.HOME;\n}\n",
      ),
    ).toEqual([]);

    expect(
      await lint(reading, "export function read() {\n  process.exit(1);\n}\n"),
    ).toEqual([expect.stringContaining("`process.exit`")]);

    const computed = "src/project/feature/computing/now.ts";

    expect(
      await lint(
        computed,
        "export function now() {\n  return Date.now();\n}\n",
      ),
    ).toEqual([expect.stringContaining("(observing) during invocation")]);

    expect(
      await lint(
        computed,
        "export function now(name: string) {\n  return Math.max(1, 2) + String(globalThis[name]);\n}\n",
      ),
    ).toEqual([]);
  });

  test("charge a write the level of the state it changes, by position", async () => {
    const lint = await createLinter({
      environments: 'src: { execution: { globals: "node", syntax: 24 } }',
      roles: [observing(), printing(), computing()],
    });

    const printed = "src/project/feature/printing/print.ts";
    const read = "src/project/feature/observing/read.ts";
    const computed = "src/project/feature/computing/now.ts";

    for (const [file, source, level] of [
      [
        printed,
        "export function print(box: { x: number }) {\n  box.x = 1;\n}\n",
        "confined",
      ],
      [
        printed,
        "export function print() {\n  let n = 0;\n  return () => {\n    n = 1;\n  };\n}\n",
        "confined",
      ],
      [
        printed,
        "const box = { x: 0 };\n\nexport function print() {\n  box.x = 1;\n}\n",
        "confined",
      ],
      [
        read,
        "export const box = { x: 0 };\n\nexport function read() {\n  box.x = 1;\n}\n",
        "effectful",
      ],
      [
        read,
        'export function read() {\n  process.env.X = "1";\n}\n',
        "effectful",
      ],
      [computed, "globalThis.x = 1;\n", "effectful"],
    ] as const) {
      expect(await lint(file, source)).toEqual([
        expect.stringContaining(`(${level})`),
      ]);
    }

    expect(
      await lint(
        computed,
        "const box = { x: 0 };\nbox.x = 1;\n\nexport class Now {\n  x = 0;\n\n  constructor(list: number[]) {\n    this.x = 1;\n    let n = 0;\n    n += 1;\n    list.push(n);\n  }\n}\n",
      ),
    ).toEqual([]);

    for (const target of ["for (x.y of list) {\n  }", "[x.y] = list;"]) {
      expect(
        await lint(
          computed,
          `export function now(x: { y: number }, list: [number]) {\n  ${target}\n}\n`,
        ),
      ).toEqual([expect.stringContaining("(confined) during invocation")]);
    }

    expect(
      await lint(
        computed,
        "export function now(options: { list: { x: number }[] }, a: { x: number }, b: { x: number }) {\n  const { list } = options;\n\n  for (const item of list) {\n    item.x = 1;\n  }\n\n  (a.x > 0 ? a : b).x = 1;\n}\n",
      ),
    ).toEqual([expect.stringContaining("`item.x`")]);

    expect(
      await lint(
        computed,
        "function makeLogger() {\n  return { log: (value: unknown) => value };\n}\n\nconst console = makeLogger();\nconsole.log = (value) => value;\n",
      ),
    ).toEqual([]);

    expect(
      await lint(
        computed,
        "export function now(start: number) {\n  return () => {\n    start += 1;\n\n    return start;\n  };\n}\n\nexport const next = now(0);\n",
      ),
    ).toEqual([expect.stringContaining("(confined) during invocation")]);
  });

  test("charge reading a variable another function declares, and a ranked member of an import", async () => {
    const lint = await createLinter({ roles: [observing(), computing()] });

    expect(
      await lint(utility, "let n = 0;\n\nexport const own = () => ++n;\n"),
    ).toEqual([
      expect.stringContaining(
        "`n` from its module's unexported state (observing)",
      ),
    ]);

    expect(
      await lint(
        utility,
        "const cache: Record<string, number> = {};\n\nfunction compute(key: string) {\n  return key.length;\n}\n\nexport const own = (key: string) => (cache[key] ??= compute(key));\n",
      ),
    ).toEqual([]);

    const home = 'import { env } from "node:process";\n\nexport function now() {\n  return env.HOME;\n}\n';

    expect(await lint("src/project/feature/computing/now.ts", home)).toEqual([
      expect.stringContaining("`env.HOME`"),
    ]);

    expect(await lint("src/project/feature/observing/read.ts", home)).toEqual(
      [],
    );
  });

  test("hint at effects lint cannot prove, reporting none as an error", async () => {
    const lint = await createLinter({ roles: [computing()] });

    const hints = "auaust/import-effect-hints";

    const factory = `${act}/**\n * @pure\n */\nexport function value() {\n  return () => act();\n}\n`;

    expect(await lint(handler, factory)).toEqual([]);

    expect(await lint(handler, factory, hints)).toEqual([
      expect.stringContaining("created inside one tagged pure invokes `act`"),
    ]);

    const passing = 'import { act, helper } from "#foundation/base/index";\n\nfunction register(fn: () => void) {\n  return fn;\n}\n\nregister(act);\nregister(helper);\n';

    expect(await lint(utility, passing)).toEqual([]);

    expect(await lint(utility, passing, hints)).toEqual([
      expect.stringContaining("passes `act`"),
    ]);

    const computed = "src/project/feature/computing/now.ts";
    const hidden = "function pick(value: { x: number }) {\n  return value;\n}\n\nexport function now(param: { x: number }) {\n  const target = pick(param);\n  const fresh = { x: 0 };\n\n  target.x = 1;\n  fresh.x = 1;\n}\n";

    expect(await lint(computed, hidden)).toEqual([]);

    expect(await lint(computed, hidden, hints)).toEqual([
      expect.stringContaining("writes `target.x`"),
    ]);

    const rootless = "function pick(value: { x: number }) {\n  return value;\n}\n\nclass Box {\n  x = 0;\n}\n\nexport function now(param: { x: number }, other: { x: number }) {\n  pick(param).x = 1;\n  (param.x > 0 ? param : other).x = 1;\n  new Box().x = 1;\n}\n";

    expect(await lint(computed, rootless)).toEqual([]);

    expect(await lint(computed, rootless, hints)).toEqual([
      expect.stringContaining("writes `pick(param).x`"),
      expect.stringContaining("writes `(param.x > 0 ? param : other).x`"),
    ]);
  });
});
