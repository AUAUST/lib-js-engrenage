import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { entrypoint } from "#project/roles/index";
import { resolveAliases } from "#project/structure/operations/resolveAliases";
import { runSync } from "#project/sync/index";
import { buildLibraryCode } from "#tests/utils/buildLibraryCode";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { syncAliases } from "#tools/typescript/setup/syncAliases";
import type { StructureNode } from "#batiment/structure/index";

async function sync(config: string, files: Record<string, string> = {}) {
  const project = createTemporaryProject({
    "package.json": '{ "name": "project", "type": "module" }',
    "tsconfig.json": "{}",
    "engrenage.config.ts": `export default ${config};\n`,
    "src/index.ts": "",
    "src/utils/index.ts": "",
    "src/types/Thing.ts": "",
    "src/constants.ts": "",
    "tests/a.test.ts": "",
    ...files,
  });

  const resolved = await loadConfig(project.root);

  await syncAliases(resolved);

  return {
    read: async (file: string) => {
      const filesystem = resolved.context.filesystem;

      return JSON.parse((await filesystem.read(file)) ?? "");
    },
  };
}

const source = 'environments: { src: { execution: { globals: "node", syntax: 24 } } }';

const bundled = (define: Record<string, string>) => {
  return `{ environments: { src: { execution: { globals: "node", syntax: 24 }, bundled: true } }, src: { aliases: { define: ${JSON.stringify(define)} } } }`;
};

async function syncOnDisk(root: string) {
  loadConfig.refresh(root);

  const resolved = await loadConfig(root);

  await syncAliases(resolved);

  await resolved.context.filesystem.flush();
}

describe("aliases", () => {
  test("generates namespace and global file aliases without source root aliases", async () => {
    const { read } = await sync(
      `{ preset: "library", environments: { src: { execution: { globals: "node", syntax: 24 } } }, src: { roles: ${JSON.stringify([entrypoint()])} }, data: { exports: {} } }`,
      { "data/a.json": "{}", "src/entry.ts": "" },
    );

    expect((await read("package.json")).imports).toEqual({
      "#constants": "./src/constants.ts",
      "#package.json": "./package.json",
      "#tests/*": "./tests/*.ts",
      "#types/*": "./src/types/*.ts",
      "#utils": "./src/utils/index.ts",
      "#utils/*": "./src/utils/*.ts",
    });
  });

  test("keeps the source root alias when generated source aliases are disabled", async () => {
    const { read } = await sync(
      '{ preset: "library", environments: { src: { execution: { globals: "node", syntax: 24 } } }, src: { aliases: { generated: false } } }',
    );

    expect((await read("package.json")).imports).toMatchObject({
      "#src/*": "./src/*.ts",
    });

    expect((await read("package.json")).imports).not.toHaveProperty(
      "#constants",
    );
  });

  test("gives a namespace holding domains its own alias only", async () => {
    const { read } = await sync(
      `{ preset: "library", environments: { src: { execution: { globals: "node", syntax: 24 } } }, src: { structure: { namespaces: { tools: {} } } } }`,
      {
        "src/tools/git/index.ts": "",
        "src/tools/git/constants.ts": "",
      },
    );

    const imports = (await read("package.json")).imports;

    expect(imports["#tools/*"]).toBe("./src/tools/*.ts");
    expect(imports).not.toHaveProperty("#git");
    expect(imports).not.toHaveProperty("#git/*");
  });

  test("fails on a src entry colliding with a root alias", async () => {
    await expect(
      sync(`{ preset: "library", ${source} }`, {
        "src/tests/a.ts": "",
      }),
    ).rejects.toThrow(/#tests\/\*.*src entry src\/tests/);
  });

  test("gives a bundled app's src aliases both TypeScript extensions, and only bundler aliases to the tsconfig paths", async () => {
    const { read } = await sync(
      `{ environments: { src: { languages: [{ name: "typescript", options: { tsx: "solid" } }], execution: { globals: "node", syntax: 24 }, bundled: true } }, src: { aliases: { define: { "$shopify/*": "./shopify/*.ts" } } } }`,
      { "data/a.json": "{}" },
    );

    expect((await read("tsconfig.json")).compilerOptions.paths).toEqual({
      "$shopify/*": ["./shopify/*.ts"],
    });

    expect((await read("package.json")).imports).toMatchObject({
      "#data/*": "./data/*",
      "#utils/*": {
        types: [
          "./src/utils/*.ts",
          "./src/utils/*.mts",
          "./src/utils/*.cts",
          "./src/utils/*.tsx",
        ],
        default: "./src/utils/*",
      },
      "#constants": {
        types: [
          "./src/constants.ts",
          "./src/constants.mts",
          "./src/constants.cts",
          "./src/constants.tsx",
        ],
        default: "./src/constants",
      },
    });

    expect((await read("package.json")).imports).not.toHaveProperty(
      "$shopify/*",
    );
  });

  test("writes no tsconfig paths for a bundled app without bundler aliases", async () => {
    const { read } = await sync(bundled({ "#shop/*": "./shopify/*.ts" }));

    expect((await read("tsconfig.json")).compilerOptions).toBeUndefined();

    expect((await read("package.json")).imports["#shop/*"]).toBe(
      "./shopify/*.ts",
    );
  });

  test("fails on a bundler alias unless the source is bundled", async () => {
    await expect(
      sync(
        `{ environments: { src: { execution: { globals: "node", syntax: 24 } } }, src: { aliases: { define: { "$shopify/*": "./shopify/*.ts" } } } }`,
      ),
    ).rejects.toThrow(/bundler alias \$shopify\/\*/);
  });

  test("leaves package.json alone when aliases are off", async () => {
    const { read } = await sync(`{ ${source}, aliases: false }`);

    expect((await read("package.json")).imports).toBeUndefined();
  });

  test("keeps a hand-declared import and records only the generated keys", async () => {
    const project = createTemporaryProject({
      "package.json": JSON.stringify({
        name: "project",
        type: "module",
        imports: { "#config/*": "./config/*.ts" },
      }),
      "tsconfig.json": "{}",
      "engrenage.config.ts": `export default { preset: "library", ${source} };\n`,
      "src/constants.ts": "",
    });

    await syncOnDisk(project.root);

    const imports = JSON.parse(project.read("package.json")).imports;

    expect(imports).toMatchObject({
      "#config/*": "./config/*.ts",
      "#constants": "./src/constants.ts",
    });

    const record = JSON.parse(project.read(".engrenage/sync.json"));

    expect(record["package.json#imports"]).toContain("#constants");
    expect(record["package.json#imports"]).not.toContain("#config/*");
  });

  test("deletes the entries of an alias removed after a recorded sync", async () => {
    const project = createTemporaryProject({
      "package.json": '{ "name": "project", "type": "module" }',
      "tsconfig.json": "{}",
      "engrenage.config.ts": `export default ${bundled({ "#shop/*": "./shopify/*.ts", "$shopify/*": "./shopify/*.ts" })};\n`,
      "src/constants.ts": "",
    });

    await syncOnDisk(project.root);

    project.write("engrenage.config.ts", `export default ${bundled({})};\n`);

    await syncOnDisk(project.root);

    const imports = JSON.parse(project.read("package.json")).imports;

    const paths = JSON.parse(project.read("tsconfig.json")).compilerOptions
      .paths;

    expect(imports).toHaveProperty("#constants");
    expect(imports).not.toHaveProperty("#shop/*");
    expect(paths).not.toHaveProperty("$shopify/*");
  });

  test("removes the src alias paths a previous sync generated, keeping the others", async () => {
    const project = createTemporaryProject({
      "package.json": '{ "name": "project", "type": "module" }',
      "tsconfig.json": JSON.stringify({
        compilerOptions: {
          paths: {
            "#constants": ["./src/constants.ts"],
            "~/*": ["./src/*"],
          },
        },
      }),
      ".engrenage/sync.json": JSON.stringify({
        "tsconfig#paths": ["#constants"],
      }),
      "engrenage.config.ts": `export default ${bundled({})};\n`,
      "src/constants.ts": "",
    });

    await syncOnDisk(project.root);

    expect(
      JSON.parse(project.read("tsconfig.json")).compilerOptions.paths,
    ).toEqual({ "~/*": ["./src/*"] });
  });

  test("fails on a hand-declared import the aliases generate with another target", async () => {
    await expect(
      sync(`{ preset: "library", ${source} }`, {
        "package.json": JSON.stringify({
          name: "project",
          type: "module",
          imports: { "#config/*": "./config/*.ts" },
        }),
        "src/config/a.ts": "",
      }),
    ).rejects.toThrow(/#config\/\*/);
  });

  function createUnrecordedBundledProject(config: string) {
    return createTemporaryProject({
      "package.json": JSON.stringify({
        name: "project",
        type: "module",
        imports: { "#config/*": config },
      }),
      "tsconfig.json": "{}",
      "engrenage.config.ts": `export default ${bundled({})};\n`,
      "src/config/a.ts": "",
    });
  }

  test("adopts an unrecorded import in the pre-bundled shape the aliases generate", async () => {
    const project = createUnrecordedBundledProject("./src/config/*.ts");

    await syncOnDisk(project.root);

    expect(
      JSON.parse(project.read("package.json")).imports["#config/*"],
    ).toEqual({
      types: ["./src/config/*.ts", "./src/config/*.mts", "./src/config/*.cts"],
      default: "./src/config/*",
    });

    expect(
      JSON.parse(project.read(".engrenage/sync.json"))["package.json#imports"],
    ).toContain("#config/*");
  });

  test("gives a flavourless src's bundled aliases no .tsx target while another environment selects a flavour", async () => {
    const project = createUnrecordedBundledProject("./src/config/*.ts");

    project.write(
      "engrenage.config.ts",
      `export default { environments: { src: { execution: { globals: "node", syntax: 24 }, bundled: true }, tests: { languages: [{ name: "typescript", options: { tsx: "preact" } }] } } };\n`,
    );

    await syncOnDisk(project.root);

    expect(
      JSON.parse(project.read("package.json")).imports["#config/*"].types,
    ).toEqual([
      "./src/config/*.ts",
      "./src/config/*.mts",
      "./src/config/*.cts",
    ]);
  });

  test("fails on an unrecorded string import outside the generated types", async () => {
    const project = createUnrecordedBundledProject("./config/*.ts");

    await expect(syncOnDisk(project.root)).rejects.toThrow(/#config\/\*/);
  });

  test("resolves a bundled app's .tsx module, type-checked and built through Vite", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": `export default {
        environments: { src: { languages: [{ name: "typescript", options: { tsx: "solid" } }], execution: { syntax: "2026-10" }, bundled: true } },
        typescript: { tsconfig: { extends: false, compilerOptions: { module: "ESNext", moduleResolution: "Bundler", target: "ESNext", jsx: "preserve", strict: true, noEmit: true, skipLibCheck: true, lib: ["ESNext"], types: [] } } },
      };\n`,
      "package.json": '{ "name": "app", "type": "module" }',
      "tsconfig.json": "{}",
      "src/ui/components/FileRouter.tsx": 'export const route: string = "routed";\n',
      "src/ui/utils/two.ts": "export const two: number = 2;\n",
      "src/main.ts": "import { route } from '#ui/components/FileRouter';\nimport { two } from '#ui/utils/two';\n\nexport const message: string = `${route} ${two}`;\n",
    });

    const resolved = await loadConfig(project.root);

    await runSync(resolved, { names: ["tsconfig", "aliases"] });

    await resolved.context.filesystem.flush();

    execFileSync(
      process.execPath,
      [
        fileURLToPath(import.meta.resolve("typescript/bin/tsc")),
        "-p",
        "tsconfig.src.json",
      ],
      { cwd: project.root, stdio: "pipe" },
    );

    const code = await buildLibraryCode(project.root, "src/main.ts");

    expect(code).toContain("routed");
  });
});

describe("scope aliases", () => {
  async function resolveScopes(files: Record<string, string>) {
    const project = createTemporaryProject({
      "package.json": '{ "name": "project", "type": "module" }',
      "tsconfig.json": "{}",
      "engrenage.config.ts": `export default { ${source} };\n`,
      "src/index.ts": "",
      "tests/a.test.ts": "",
      "theme/.workspace.json": "{}",
      "theme/src/.namespace.json": "{}",
      "theme/src/a.ts": "",
      ...files,
    });

    const config = await loadConfig(project.root);

    return { config, scopes: await config.resolve("aliases.scopes") };
  }

  test("aliases a workspace's unwalked structured namespace by directory, relative to the workspace", async () => {
    const { scopes } = await resolveScopes({});

    expect(scopes.theme?.global).toContainEqual({
      key: "#src/*",
      target: "./src/*.ts",
      source: "src environment",
      path: "theme/src",
    });
  });

  test("aliases the children of a workspace's source structure relative to the workspace", async () => {
    const { config } = await resolveScopes({ "theme/src/ui/index.ts": "" });

    const languages = await config.context.registry.contributions(
      "languages",
      config,
    );

    const typescript = languages.find(({ entry }) => {
      return entry.name === "typescript";
    });

    if (typescript === undefined) {
      throw new Error("No typescript language is contributed");
    }

    const root: StructureNode = {
      path: "theme/src",
      name: "src",
      kind: "namespace",
      source: "inferred",
      children: [
        {
          path: "theme/src/ui",
          name: "ui",
          kind: "domain",
          source: "inferred",
          children: [],
        },
      ],
    };

    const { global, src } = await resolveAliases({
      filesystem: config.context.filesystem,
      scope: "theme",
      options: {
        global: {
          enabled: true,
          generated: true,
          define: {},
        },
        src: {
          enabled: true,
          generated: true,
          define: {},
        },
      },
      bundled: false,
      namespaces: {
        src: ["theme/src"],
      },
      data: [],
      outDir: undefined,
      source: {
        name: "src",
        structure: {
          name: "src",
          dirs: ["theme/src"],
          strictness: "strict",
          root,
          unclassified: [],
          roles: {},
          unreached: [],
          entries: {},
          diagnostics: [],
          indexFile: "index.ts",
          entryFile: undefined,
        },
      },
      language: typescript.entry,
    });

    expect(global.map(({ key }) => key)).toEqual(["#package.json"]);

    expect(src).toContainEqual(
      expect.objectContaining({
        key: "#ui",
        target: "./src/ui/index.ts",
        path: "theme/src/ui",
      }),
    );
  });

  test("lets a workspace's table repeat a key of the root's", async () => {
    const { scopes } = await resolveScopes({
      "theme/tests/.namespace.json": "{}",
      "theme/tests/a.test.ts": "",
    });

    for (const scope of [".", "theme"]) {
      expect(scopes[scope]?.global.map(({ key }) => key)).toEqual(
        expect.arrayContaining(["#package.json", "#tests/*"]),
      );
    }
  });
});
