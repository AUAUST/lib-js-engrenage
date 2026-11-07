import { mkdirSync } from "node:fs";

import { describe, expect, test } from "vitest";

import { loadConfig, structureSection } from "@auaust/engrenage";
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

function createProject(options: string) {
  const project = createTemporaryProject({
    ...files,
    "engrenage.config.ts": `export default ${options};\n`,
  });

  mkdirSync(project.resolve("src/empty"));

  return project;
}

async function loadStructure(root: string) {
  const config = await loadConfig(root);

  return config.resolve(structureSection);
}

type StructureNode = NonNullable<
  Awaited<ReturnType<typeof loadStructure>>["src"]
>["root"];

function flatten(node: StructureNode): StructureNode[] {
  return [node, ...node.children.flatMap(flatten)];
}

async function describeSource(options: string) {
  const config = await loadConfig(createProject(options).root);

  const nodes = new Map(
    flatten((await config.resolve(structureSection)).src!.root).map((node) => [
      node.path,
      node,
    ]),
  );

  return { structure: (await config.resolve(structureSection)).src!, nodes };
}

const declaration = `{
  preset: "library",
  src: {
    roles: ${sourceRoles},
    namespaces: {
      ".": { layers: ["zone", "*"] },
      zone: { layers: ["base", "*", "top"] },
      ui: { roles: { enable: ["components"] } },
    },
    domains: {
      errors: { purpose: "Error classes." },
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

  test("attaches layers and domain metadata", async () => {
    const { nodes } = await describeSource(declaration);

    expect(
      ["base", "mid", "top"].map((name) => {
        return nodes.get(`src/zone/${name}`)?.layer;
      }),
    ).toEqual([0, 1, 2]);

    expect(nodes.get("src/zone")?.layer).toBe(0);
    expect(nodes.get("src/feature")).toMatchObject({ public: false });
    expect(nodes.get("src/feature/sub")).toMatchObject({ public: true });

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

  test("counts unclassified directories as domains under loose", async () => {
    const { structure, nodes } = await describeSource(
      declaration.replace("optOut:", 'strictness: "loose", optOut:'),
    );

    expect(nodes.get("src/mystery")).toMatchObject({ kind: "domain" });
    expect(structure.unclassified).toEqual([]);
  });

  test("enables scoped roles only inside the namespace that declares them", async () => {
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

  test("reads role-named directories as domains and namespaces without roles", async () => {
    const { nodes } = await describeSource("{}");

    expect(nodes.get("src/feature/utils")).toMatchObject({
      kind: "unclassified",
    });
  });

  test("never walks the project root as an environment directory", async () => {
    const project = createProject("{}");
    const config = await loadConfig(project.root);

    expect(
      (await config.resolve(structureSection)).tooling?.root.children,
    ).toEqual([]);
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
      const structure = (await config.resolve(structureSection)).tests!;

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

      expect(nodes.get("tests/fixtures")).toMatchObject({ kind: "role" });

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
        "engrenage.config.ts": `export default { src: { roles: ${sourceRoles} }, tests: { mirror: true, roles: ${testsRoles} } };\n`,
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
      flatten((await config.resolve(structureSection)).src!.root).map(
        (node) => [node.path, node],
      ),
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
      "src.roles[9].roles[0] and src.roles[9].roles[1] are both named types",
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
    ).replace(JSON.stringify("<setup>"), '() => "setup.ts"');

    await expect(
      describeProject(`{ src: { roles: ${roles} } }`),
    ).rejects.toThrow("gives the role setup a `file` callback");
  });

  test("of a namespace are active only in its subtree", async () => {
    const nodes = await describeProject(`{
      src: {
        roles: ${renderCodeRoles()},
        namespaces: {
          ui: { roles: { enable: [{ name: "widgets", exports: "named-match" }] } },
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
  const readme = createRolePreset({ name: "readme", file: "README.md" });

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
    const roles = renderCodeRoles(readme({ required: true, scoped: true }));

    const nodes = await describeProject(
      `{ roles: ${roles}, namespaces: { docs: { roles: { enable: ["readme"] } } } }`,
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
