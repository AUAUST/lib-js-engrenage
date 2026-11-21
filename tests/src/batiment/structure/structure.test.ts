import { mkdirSync } from "node:fs";

import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage/extensions";
import {
  components,
  createRolePreset,
  entry,
  fixtures,
  testsetup,
} from "@auaust/engrenage/roles";
import { record } from "@auaust/toolkit/object";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { renderCodeRoles } from "#tests/utils/renderCodeRoles";

const sourceRoles = renderCodeRoles(entry(), components());

const testsRoles = renderCodeRoles(fixtures(), testsetup());

const files = {
  "package.json": '{ "name": "project", "type": "module" }',
  "src/entry.ts": "",
  "src/zone/top/index.ts": "",
  "src/zone/base/index.ts": "",
  "src/zone/mid/index.ts": "",
  "src/feature/index.ts": "",
  "src/feature/utils/a.ts": "",
  "src/feature/sub/index.ts": "",
  "src/feature/sub/entry.ts": "",
  "src/feature/sub/types/T.ts": "",
  "src/errors/index.ts": "",
  "src/types/index.ts": "",
  "src/group/one/index.ts": "",
  "src/mystery/a.ts": "",
  "src/ui/button/index.ts": "",
  "src/ui/button/components/Button.tsx": "",
};

function createProject(options: string, extra: Record<string, string> = {}) {
  const project = createTemporaryProject({
    ...files,
    ...extra,
    "engrenage.config.ts": `export default ${options};\n`,
  });

  mkdirSync(project.resolve("src/empty"));

  return project;
}

async function loadStructure(root: string) {
  const config = await loadConfig(root);

  return config.resolve("structure");
}

type StructureNode = NonNullable<
  Awaited<ReturnType<typeof loadStructure>>["src"]
>["root"];

function flatten(node: StructureNode): StructureNode[] {
  return [node, ...node.children.flatMap(flatten)];
}

async function describeSource(
  options: string,
  extra: Record<string, string> = {},
) {
  const config = await loadConfig(createProject(options, extra).root);

  const nodes = new Map(
    flatten((await config.resolve("structure")).src!.root).map((node) => {
      return [node.path, node];
    }),
  );

  return {
    structure: (await config.resolve("structure")).src!,
    nodes,
  };
}

const declaration = `{
  preset: "library",
  src: {
    roles: ${sourceRoles},
    structure: {
      layers: ["zone", "*"],
      namespaces: {
        zone: { layers: ["base", "*", "top"] },
        ui: { roles: { enable: ["components"] } },
      },
      domains: {
        errors: { purpose: "Error classes." },
      },
    },
    optOut: ["types"],
  },
}`;

describe("structure", () => {
  test("classifies every directory with its source under strict", async () => {
    const { structure, nodes } = await describeSource(declaration);

    const summary = record(
      [...nodes].map(([path, { kind, source }]) => {
        return [path, [kind, source]] as const;
      }),
    );

    expect(summary).toMatchObject({
      "src/zone": ["namespace", "config"],
      "src/zone/base": ["domain", "inferred"],
      "src/feature": ["domain", "inferred"],
      "src/feature/utils": ["role", "inferred"],
      "src/feature/sub": ["domain", "inferred"],
      "src/feature/sub/types": ["role", "inferred"],
      "src/errors": ["domain", "config"],
      "src/types": ["domain", "inferred"],
      "src/group": ["namespace", "inferred"],
      "src/group/one": ["domain", "inferred"],
      "src/ui": ["namespace", "config"],
      "src/ui/button/components": ["role", "inferred"],
      "src/mystery": ["unclassified", "inferred"],
    });

    expect(nodes.has("src/empty")).toBe(false);

    expect(structure.unclassified.map(({ path }) => path)).toEqual([
      "src/mystery",
    ]);
  });

  test("reports declarations the walk never reaches", async () => {
    const { structure } = await describeSource(declaration, {
      "src/feature/utils/x/.domain.json": "{}",
    });

    expect(structure.unreached).toEqual([
      {
        path: "feature/utils/x",
        kind: "domain",
        config: false,
        files: ["src/feature/utils/x/.domain.json"],
      },
    ]);
  });

  test("reports a domain glob matching no node", async () => {
    const { structure } = await describeSource(
      declaration.replace(
        'zone: { layers: ["base", "*", "top"] },',
        'zone: { layers: ["base", "*", "top"], domains: { "none-*": {} } },',
      ),
    );

    expect(structure.unreached).toEqual([
      {
        path: "zone/none-*",
        kind: "domain",
        config: true,
        files: [],
      },
    ]);
  });

  test("reports no unreached declaration when every one is walked", async () => {
    const { structure } = await describeSource(declaration);

    expect(structure.unreached).toEqual([]);
  });

  test("attaches layers and domain metadata", async () => {
    const { nodes } = await describeSource(declaration);

    expect(
      ["base", "mid", "top"].map((name) => {
        return nodes.get(`src/zone/${name}`)?.layer;
      }),
    ).toEqual([0, 1, 2]);

    expect(nodes.get("src/zone")?.layer).toBe(0);
    expect(nodes.get("src/feature")).toMatchObject({ public: false });

    expect(nodes.get("src/feature/sub")).toMatchObject({
      public: true,
    });

    expect(nodes.get("src/errors")).toMatchObject({
      purpose: "Error classes.",
    });
  });

  test("attaches purposes to namespaces and catalogue roles", async () => {
    const { nodes } = await describeSource(
      declaration.replace(
        "ui: {",
        'ui: { purpose: "Interface.", relation: "isolated",',
      ),
    );

    expect(nodes.get("src/ui")).toMatchObject({
      purpose: "Interface.",
      relation: "isolated",
    });

    expect(nodes.get("src/feature/utils")?.purpose).toBe(
      "Confined functions, one per module.",
    );
  });

  test("resolves namespaces and sub-domains declared under a domain", async () => {
    const { nodes } = await describeSource(
      `{
        preset: "library",
        src: {
          roles: ${sourceRoles},
          structure: {
            domains: {
              feature: {
                purpose: "The feature.",
                namespaces: { parts: { purpose: "Its parts.", layers: ["low", "*"] } },
                domains: { sub: { purpose: "Its sub-domain.", specifier: "./subfeature" } },
              },
            },
          },
        },
      }`,
      {
        "src/feature/parts/low/index.ts": "",
        "src/feature/parts/high/index.ts": "",
      },
    );

    expect(nodes.get("src/feature")).toMatchObject({
      kind: "domain",
      source: "config",
      purpose: "The feature.",
    });

    expect(nodes.get("src/feature/parts")).toMatchObject({
      kind: "namespace",
      source: "config",
      purpose: "Its parts.",
    });

    expect(
      ["low", "high"].map((name) => {
        return nodes.get(`src/feature/parts/${name}`)?.layer;
      }),
    ).toEqual([0, 1]);

    expect(nodes.get("src/feature/sub")).toMatchObject({
      kind: "domain",
      source: "config",
      purpose: "Its sub-domain.",
      specifier: "./subfeature",
    });
  });

  test("adds the metadata of a glob under a namespace to its domains only", async () => {
    const { nodes } = await describeSource(
      declaration.replace(
        'zone: { layers: ["base", "*", "top"] },',
        'zone: { layers: ["base", "*", "top"], domains: { "*": { purpose: "A zone domain." } } },',
      ),
    );

    expect(nodes.get("src/zone/base")).toMatchObject({
      kind: "domain",
      source: "inferred",
      purpose: "A zone domain.",
    });

    expect(nodes.get("src/feature")?.purpose).toBeUndefined();
  });

  test("reads metadata files beside the directories they describe", async () => {
    const { nodes } = await describeSource(declaration, {
      "src/feature/.domain.json": '{ "purpose": "The feature." }',
      "src/group/.namespace.json": '{ "layers": ["one", "*"] }',
    });

    expect(nodes.get("src/feature")).toMatchObject({
      kind: "domain",
      source: "metadata",
      purpose: "The feature.",
    });

    expect(nodes.get("src/feature")?.strays).toBeUndefined();

    expect(nodes.get("src/group")).toMatchObject({
      kind: "namespace",
      source: "metadata",
      layers: ["one", "*"],
    });
  });

  test("reads the root namespace from the environment metafile", async () => {
    const { structure } = await describeSource(declaration, {
      "src/.environment.json": '{ "layers": ["*", "zone"] }',
    });

    expect(structure.root).toMatchObject({ layers: ["*", "zone"] });
  });

  test("keeps the environment metafile over a namespace metafile beside it", async () => {
    const { structure } = await describeSource(declaration, {
      "src/.environment.json": '{ "layers": ["*", "zone"] }',
      "src/.namespace.json": '{ "layers": ["zone", "*"] }',
    });

    expect(structure.root).toMatchObject({ layers: ["*", "zone"] });
  });

  test("lets a domain file override the fields of a matching config glob", async () => {
    const { nodes } = await describeSource(
      declaration.replace(
        'zone: { layers: ["base", "*", "top"] },',
        'zone: { layers: ["base", "*", "top"], domains: { "*": { specifier: "./zoned" } } },',
      ),
      { "src/zone/base/.domain.json": '{ "purpose": "The base." }' },
    );

    expect(nodes.get("src/zone/base")).toMatchObject({
      specifier: "./zoned",
      purpose: "The base.",
    });
  });

  test("reports a domain declared `public: false` beside its entry file, keeping it private", async () => {
    const { structure, nodes } = await describeSource(declaration, {
      "src/feature/sub/.domain.json": '{ "public": false }',
    });

    expect(
      structure.diagnostics.filter(({ code }) => {
        return code === "private-domain-entry";
      }),
    ).toMatchObject([
      {
        severity: "error",
        blocking: true,
        files: ["src/feature/sub/entry.ts"],
      },
    ]);

    expect(nodes.get("src/feature/sub")?.public).toBe(false);
  });

  test("reports a field set by both the config input and a metadata file, keeping the metadata's", async () => {
    const { structure, nodes } = await describeSource(declaration, {
      "src/errors/.domain.json": '{ "purpose": "Errors." }',
    });

    const conflicts = structure.diagnostics.filter(({ code }) => {
      return code === "config-metafile-conflict";
    });

    expect(conflicts).toMatchObject([
      {
        severity: "error",
        blocking: true,
        files: ["src/errors/.domain.json"],
        config: {
          origin: { layer: "input" },
        },
      },
    ]);

    expect(conflicts[0]?.config?.path).toMatch(/\.purpose$/);
    expect(nodes.get("src/errors")?.purpose).toBe("Errors.");
  });

  test("fails on a name declared as a namespace and as a domain of one node", async () => {
    await expect(
      describeSource(
        "{ src: { structure: { namespaces: { zone: { namespaces: { base: {} }, domains: { base: {} } } } } } }",
      ),
    ).rejects.toThrow(
      "zone/base is declared as a namespace and as a domain in the src environment",
    );
  });

  test("counts unclassified directories as domains under loose", async () => {
    const { structure, nodes } = await describeSource(
      declaration.replace("optOut:", 'strictness: "loose", optOut:'),
    );

    expect(nodes.get("src/mystery")).toMatchObject({
      kind: "domain",
    });

    expect(structure.unclassified).toEqual([]);
  });

  test("enables opt-in roles only inside the namespace that declares them", async () => {
    const { nodes } = await describeSource(
      declaration.replace(
        'ui: { roles: { enable: ["components"] } },',
        "ui: {},",
      ),
    );

    expect(nodes.get("src/ui/button/components")).toMatchObject({
      kind: "unclassified",
    });
  });

  test('classifies every child of a `children: "domains"` namespace as a domain', async () => {
    const extra = { "src/ui/bare/utils/isString.ts": "" };

    const declared = await describeSource(
      declaration.replace("ui: {", 'ui: { children: "domains",'),
      extra,
    );

    expect(declared.nodes.get("src/ui")).toMatchObject({
      kind: "namespace",
      childKind: "domains",
    });

    expect(declared.nodes.get("src/ui/bare")).toMatchObject({
      kind: "domain",
      source: "config",
    });

    const { nodes } = await describeSource(declaration, extra);

    expect(nodes.get("src/ui/bare")).toMatchObject({
      kind: "unclassified",
    });

    const fromMetadata = await describeSource(declaration, {
      "src/group/.namespace.json": '{ "children": "domains" }',
      "src/group/bare/utils/isString.ts": "",
    });

    expect(fromMetadata.nodes.get("src/group")).toMatchObject({
      kind: "namespace",
      childKind: "domains",
      source: "metadata",
    });

    expect(fromMetadata.nodes.get("src/group/bare")).toMatchObject({
      kind: "domain",
      source: "metadata",
    });
  });

  test("reads role-named directories as domains and namespaces without roles", async () => {
    const { nodes } = await describeSource(`{ src: { omitRoles: ["utils"] } }`);

    expect(nodes.get("src/feature/utils")).toMatchObject({
      kind: "unclassified",
    });
  });

  test("never walks the project root as an environment directory", async () => {
    const project = createProject("{}");

    const config = await loadConfig(project.root);

    expect((await config.resolve("structure")).tooling?.root.children).toEqual(
      [],
    );
  });

  test.each([
    ["one error under strict", declaration, ["src/mystery"]],
    [
      "no error under loose",
      declaration.replace("optOut:", 'strictness: "loose", optOut:'),
      [],
    ],
  ] as const)(
    "reports %s on an unclassified directory",
    async (_verdict, options, paths) => {
      const { structure } = await describeSource(options);

      const unclassified = structure.diagnostics.filter(({ code }) => {
        return code === "unclassified";
      });

      expect(
        unclassified.map(({ severity, path }) => [severity, path]),
      ).toEqual(paths.map((path) => ["error", path]));
    },
  );

  test("warns on a domain without purpose", async () => {
    const project = createTemporaryProject({
      "package.json": '{ "name": "project", "type": "module" }',
      "src/index.ts": "",
      "src/feature/index.ts": "",
      "engrenage.config.ts": 'export default { src: { strictness: "loose" } };\n',
    });

    const { src } = await loadStructure(project.root);

    expect(src?.diagnostics).toEqual([
      {
        severity: "warning",
        code: "missing-purpose",
        message: "has no purpose: set one on its `domains` entry.",
        environment: "src",
        path: "src/feature",
        files: [],
      },
    ]);
  });

  describe("tests mirror", () => {
    async function describeTests(mirror: boolean, extra: string[]) {
      const project = createTemporaryProject({
        "package.json": '{ "name": "project", "type": "module" }',
        "src/entry.ts": "",
        "src/a/b/index.ts": "",
        ...record(
          ["tests/src/a/x.test.ts", "tests/fixtures/any/f.txt", ...extra].map(
            (file) => [file, ""],
          ),
        ),
        "engrenage.config.ts": `export default { src: { roles: ${sourceRoles} }, tests: { mirror: ${mirror}, roles: ${testsRoles} } };\n`,
      });

      const config = await loadConfig(project.root);

      const structure = (await config.resolve("structure")).tests!;

      return {
        structure,
        nodes: new Map(
          flatten(structure.root).map((node) => [node.path, node]),
        ),
      };
    }

    test("mirror requires the counterpart of every directory below a root key", async () => {
      const { structure, nodes } = await describeTests(true, [
        "tests/src/a/c/y.test.ts",
        "tests/hello/z.test.ts",
      ]);

      expect(nodes.get("tests/src")).toMatchObject({
        kind: "mirror",
        mirror: { environment: "src" },
      });

      expect(nodes.get("tests/src/a")).toMatchObject({
        kind: "mirror",
        mirror: { environment: "src", path: "src/a" },
      });

      expect(nodes.get("tests/fixtures")).toMatchObject({
        kind: "role",
      });

      expect(
        structure.unclassified.map(({ path, reason }) => [path, reason]),
      ).toEqual([
        ["tests/hello", "unknown root key"],
        ["tests/src/a/c", "missing counterpart"],
      ]);
    });

    test("a mirror takes the kind of its counterpart, not its name", async () => {
      const project = createTemporaryProject({
        "package.json": '{ "name": "project", "type": "module" }',
        "src/entry.ts": "",
        "src/a/utils/index.ts": "",
        "src/a/b/index.ts": "",
        "src/a/b/utils/x.ts": "",
        "tests/src/a/utils/x.test.ts": "",
        "tests/src/a/b/utils/y.test.ts": "",
        "engrenage.config.ts": `export default { src: { roles: ${sourceRoles} }, tests: { mirror: true, roles: ${testsRoles}, omitRoles: ["testutils"] } };\n`,
      });

      const structure = await loadStructure(project.root);

      const nodes = new Map(
        flatten(structure.tests!.root).map((node) => [node.path, node]),
      );

      expect(nodes.get("tests/src/a/utils")).toMatchObject({
        kind: "mirror",
      });

      expect(nodes.get("tests/src/a/b/utils")).toMatchObject({
        kind: "role",
        role: "utils",
      });
    });

    test("reports and ignores a metadata file in the mirrored environment", async () => {
      const project = createTemporaryProject({
        "package.json": '{ "name": "project", "type": "module" }',
        "src/entry.ts": "",
        "src/a/index.ts": "",
        "tests/src/a/x.test.ts": "",
        "tests/src/a/.domain.json": '{ "purpose": "Tests of a." }',
        "engrenage.config.ts": `export default { src: { roles: ${sourceRoles} }, tests: { mirror: true, roles: ${testsRoles} } };\n`,
      });

      const structure = await loadStructure(project.root);

      expect(structure.tests?.diagnostics).toMatchObject([
        {
          code: "mirrored-metafile",
          blocking: true,
          files: ["tests/src/a/.domain.json"],
        },
      ]);

      const mirrored = flatten(structure.tests!.root).find(({ path }) => {
        return path === "tests/src/a";
      });

      expect(mirrored?.purpose).toBeUndefined();
    });

    test("roots accepts any directory below a root key", async () => {
      const { structure, nodes } = await describeTests(false, [
        "tests/src/anything/deep/y.test.ts",
        "tests/hello/z.test.ts",
      ]);

      expect(nodes.get("tests/src/anything/deep")).toMatchObject({
        kind: "mirror",
      });

      expect(structure.unclassified.map(({ path }) => path)).toEqual([
        "tests/hello",
      ]);
    });
  });
});

describe("tooling structure", () => {
  test("walks tooling/ into the tooling tree and leaves other root directories unwalked", async () => {
    const project = createTemporaryProject({
      "package.json": '{ "name": "project", "type": "module" }',
      "engrenage.config.ts": "export default {};\n",
      "tooling/eslint/index.ts": "",
      "other/stray.ts": "",
    });

    const structure = await loadStructure(project.root);

    const names = structure.tooling?.root.children.map(({ name }) => name);

    expect(names).toEqual(["eslint"]);

    expect(structure.tooling?.root.children.at(0)?.kind).toBe("domain");
  });
});

describe("inline roles", () => {
  const files = {
    "package.json": '{ "name": "project", "type": "module" }',
    "src/entry.ts": "",
    "src/x/index.ts": "",
    "src/x/game/types/T.ts": "",
    "src/x/types/T.ts": "",
    "src/other/index.ts": "",
    "src/other/types/T.ts": "",
    "src/ui/button/index.ts": "",
    "src/ui/button/widgets/W.ts": "",
    "src/elsewhere/index.ts": "",
    "src/elsewhere/widgets/W.ts": "",
  };

  async function describeProject(options: string) {
    const project = createTemporaryProject({
      ...files,
      "engrenage.config.ts": `export default ${options};\n`,
    });

    const config = await loadConfig(project.root);

    return new Map(
      flatten((await config.resolve("structure")).src!.root).map((node) => {
        return [node.path, node];
      }),
    );
  }

  const game = createRolePreset({ name: "game" });

  const arcade = createRolePreset({ name: "arcade" });

  const types = createRolePreset({ name: "types" });

  test("shadow a root role inside their owner only", async () => {
    const roles = renderCodeRoles(
      game({ roles: [types({ exports: "default" })] }),
    );

    const nodes = await describeProject(`{ src: { roles: ${roles} } }`);

    expect(nodes.get("src/x/game/types")).toMatchObject({
      kind: "role",
      role: "game/types",
    });

    expect(nodes.get("src/x/types")).toMatchObject({
      kind: "role",
      role: "types",
    });
  });

  test("fail when one list names a role twice, and pass across owners", async () => {
    const twice = renderCodeRoles(game({ roles: [types(), types()] }));

    await expect(
      describeProject(`{ src: { roles: ${twice} } }`),
    ).rejects.toThrow(
      "src.roles[10].roles[0] and src.roles[10].roles[1] are both named types",
    );

    const owners = renderCodeRoles(
      game({ roles: [types()] }),
      arcade({ roles: [types()] }),
    );

    const nodes = await describeProject(`{ src: { roles: ${owners} } }`);

    expect(nodes.get("src/x/game/types")).toMatchObject({
      role: "game/types",
    });
  });

  test("take a `file` callback only as nested file roles", async () => {
    const roles = renderCodeRoles(
      createRolePreset({ name: "setup", file: "<setup>" })(),
    ).replace(
      JSON.stringify("<setup>"),
      '{ resolve: () => "setup.ts", description: "setup.ts" }',
    );

    await expect(
      describeProject(`{ src: { roles: ${roles} } }`),
    ).rejects.toThrow("gives the role setup a `file` callback");
  });

  test("reject `companions` without a description", async () => {
    const guards = '{ name: "guards", companions: { resolve: () => "src/assert.ts" } }';

    await expect(
      describeProject(
        `{ src: { roles: [...${renderCodeRoles()}, ${guards}] } }`,
      ),
    ).rejects.toThrow("at roles.9.companions.description");
  });

  test("fail when type-only with exported values", async () => {
    const roles = renderCodeRoles(
      createRolePreset({
        name: "shapes",
        typeOnly: true,
        exports: { values: "named" },
      })(),
    );

    await expect(
      describeProject(`{ src: { roles: ${roles} } }`),
    ).rejects.toThrow("The type-only role shapes exports values");
  });

  test("fail when exposed as subpaths without being public", async () => {
    const roles = renderCodeRoles(
      createRolePreset({
        name: "symbols",
        file: ["symbols.ts"],
        subpath: true,
      })(),
    );

    await expect(
      describeProject(`{ src: { roles: ${roles} } }`),
    ).rejects.toThrow("The role symbols sets `subpath` but is not public");
  });

  test("fail when exposed in every domain with a root-only index and no static file", async () => {
    const roles = renderCodeRoles(
      createRolePreset({
        name: "models",
        index: "root",
        public: true,
        subpath: true,
      })(),
    );

    await expect(
      describeProject(`{ src: { roles: ${roles} } }`),
    ).rejects.toThrow(
      'The role models sets `subpath` true with `index` "root"',
    );
  });

  test("of a namespace are active only in its subtree", async () => {
    const nodes = await describeProject(`{
      src: {
        roles: ${renderCodeRoles()},
        structure: {
          namespaces: {
            ui: { roles: { enable: [{ name: "widgets", exports: "named-match" }] } },
          },
        },
      },
    }`);

    expect(nodes.get("src/ui/button/widgets")).toMatchObject({
      kind: "role",
      role: "src:ui/widgets",
    });

    expect(nodes.get("src/elsewhere/widgets")).toMatchObject({
      kind: "unclassified",
    });
  });
});

describe("unique roles", () => {
  const config = createRolePreset({ name: "config" });

  const helpers = createRolePreset({ name: "helpers" });

  async function describeProject(
    roles: string,
    sources: Readonly<Record<string, string>>,
  ) {
    const project = createTemporaryProject({
      "package.json": '{ "name": "project", "type": "module" }',
      "src/a/index.ts": "",
      ...sources,
      "engrenage.config.ts": `export default { src: { roles: ${roles} } };\n`,
    });

    const structure = await loadStructure(project.root);

    return new Map(
      flatten(structure.src!.root).map((node) => [node.path, node]),
    );
  }

  function definers(unique: boolean) {
    return renderCodeRoles(
      config({
        strict: true,
        roles: [
          {
            name: "definers",
            file: "define*Config.ts",
            unique,
          },
        ],
      }),
    );
  }

  const twoDefiners = {
    "src/a/config/defineAConfig.ts": "",
    "src/a/config/defineBConfig.ts": "",
  };

  test("report one violation naming every file of a location", async () => {
    const nodes = await describeProject(definers(true), twoDefiners);

    expect(nodes.get("src/a/config")?.cardinality).toEqual([
      {
        role: "config/definers",
        reason: "unique",
        files: [
          "src/a/config/defineAConfig.ts",
          "src/a/config/defineBConfig.ts",
        ],
        globs: ["define*Config.ts"],
      },
    ]);
  });

  test("pass with one file, and with several when not unique", async () => {
    const single = await describeProject(definers(true), {
      "src/a/config/defineAConfig.ts": "",
    });

    const several = await describeProject(definers(false), twoDefiners);

    expect(single.get("src/a/config")?.cardinality).toBeUndefined();
    expect(several.get("src/a/config")?.cardinality).toBeUndefined();
  });

  test("count a directory role's files across its nested directories", async () => {
    const nodes = await describeProject(
      renderCodeRoles(helpers({ nesting: "any", unique: true })),
      {
        "src/a/helpers/x.ts": "",
        "src/a/helpers/deep/y.ts": "",
      },
    );

    expect(nodes.get("src/a/helpers")?.cardinality).toEqual([
      {
        role: "helpers",
        reason: "unique",
        files: ["src/a/helpers/deep/y.ts", "src/a/helpers/x.ts"],
        globs: ["**"],
      },
    ]);
  });
});

describe("required roles", () => {
  const readme = createRolePreset({
    name: "readme",
    file: "README.md",
  });

  const config = createRolePreset({ name: "config" });

  async function describeProject(
    options: string,
    sources: Readonly<Record<string, string>>,
  ) {
    const project = createTemporaryProject({
      "package.json": '{ "name": "project", "type": "module" }',
      ...sources,
      "engrenage.config.ts": `export default { src: ${options} };\n`,
    });

    const structure = await loadStructure(project.root);

    return new Map(
      flatten(structure.src!.root).map((node) => [node.path, node]),
    );
  }

  test("report a domain missing a required domain file role, unless it holds one or the role is inactive", async () => {
    const roles = renderCodeRoles(readme({ required: true, optIn: true }));

    const nodes = await describeProject(
      `{ roles: ${roles}, structure: { namespaces: { docs: { roles: { enable: ["readme"] } } } } }`,
      {
        "src/docs/missing/index.ts": "",
        "src/docs/held/index.ts": "",
        "src/docs/held/README.md": "",
        "src/other/index.ts": "",
      },
    );

    expect(nodes.get("src/docs/missing")?.cardinality).toEqual([
      {
        role: "readme",
        reason: "required",
        files: [],
        globs: ["README.md"],
      },
    ]);

    expect(nodes.get("src/docs/held")?.cardinality).toBeUndefined();
    expect(nodes.get("src/other")?.cardinality).toBeUndefined();
  });

  test("hold exactly one file when unique and required", async () => {
    const roles = renderCodeRoles(
      config({
        strict: true,
        roles: [
          {
            name: "definers",
            file: "define*Config.ts",
            unique: true,
            required: true,
          },
        ],
      }),
    );

    const nodes = await describeProject(`{ roles: ${roles} }`, {
      "src/two/index.ts": "",
      "src/two/config/defineAConfig.ts": "",
      "src/two/config/defineBConfig.ts": "",
      "src/none/index.ts": "",
      "src/none/config/sections.ts": "",
      "src/one/index.ts": "",
      "src/one/config/defineOneConfig.ts": "",
    });

    expect(nodes.get("src/two/config")?.cardinality).toEqual([
      {
        role: "config/definers",
        reason: "unique",
        files: [
          "src/two/config/defineAConfig.ts",
          "src/two/config/defineBConfig.ts",
        ],
        globs: ["define*Config.ts"],
      },
    ]);

    expect(nodes.get("src/none/config")?.cardinality).toEqual([
      {
        role: "config/definers",
        reason: "required",
        files: [],
        globs: ["define*Config.ts"],
      },
    ]);

    expect(nodes.get("src/one/config")?.cardinality).toBeUndefined();
  });
});

describe("layouts", () => {
  const sections = createRolePreset({
    name: "sections",
    purpose: "Theme sections.",
  });

  const layout = {
    nature: "static",
    name: "theme",
    entries: {
      sections: { role: "sections" },
      layout: { required: true },
    },
  };

  test("a contributed static layout, selected by name, classifies its entries and reports the rest", async () => {
    const project = createTemporaryProject({
      "package.json": '{ "name": "project", "type": "module" }',
      "engrenage.config.ts": [
        "export default {",
        `  scripts: { layout: "theme", roles: ${renderCodeRoles(sections())} },`,
        "  extensions: [{",
        '    name: "fixture",',
        `    contributes: { layouts: [{ name: "theme", load: () => Promise.resolve(${JSON.stringify(layout)}) }] },`,
        "  }],",
        "};",
      ].join("\n"),
      "scripts/sections/a.ts": "",
      "scripts/widgets/b.ts": "",
    });

    const structure = await loadStructure(project.root);

    const children = record(
      structure.scripts!.root.children.map((child) => {
        return [child.name, child.kind] as const;
      }),
    );

    expect(children).toEqual({ sections: "role", widgets: "unclassified" });

    const codes = structure.scripts!.diagnostics.map(({ code }) => code);

    expect(codes).toEqual(
      expect.arrayContaining(["unlisted-layout-entry", "missing-layout-entry"]),
    );
  });
});
