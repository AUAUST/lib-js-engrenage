import { mkdirSync } from "node:fs";

import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage";
import { record } from "@auaust/toolkit/object";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

const files = {
  "package.json": '{ "name": "project", "type": "module" }',
  "src/index.ts": "",
  "src/zone/top/index.ts": "",
  "src/zone/base/index.ts": "",
  "src/zone/mid/index.ts": "",
  "src/feature/index.ts": "",
  "src/feature/utils/a.ts": "",
  "src/feature/sub/index.ts": "",
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

type StructureNode = NonNullable<
  Awaited<ReturnType<typeof loadConfig>>["structure"]["src"]
>["root"];

function flatten(node: StructureNode): StructureNode[] {
  return [node, ...node.children.flatMap(flatten)];
}

async function describeSource(options: string) {
  const config = await loadConfig(createProject(options).root);

  const nodes = new Map(
    flatten(config.structure.src!.root).map((node) => [node.path, node]),
  );

  return { structure: config.structure.src!, nodes };
}

const declaration = `{
  src: {
    namespaces: {
      ".": { layers: ["zone", "*"] },
      zone: { layers: ["base", "*", "top"] },
      ui: { roles: { enable: ["components"] } },
    },
    domains: {
      errors: { purpose: "Error classes." },
      "feature/*": { public: true },
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
    const { nodes } = await describeSource(`{ roles: false }`);

    expect(nodes.get("src/feature/utils")).toMatchObject({
      kind: "unclassified",
    });
  });

  test("never walks the project root as an environment directory", async () => {
    const project = createProject("{}");
    const config = await loadConfig(project.root);

    expect(config.structure.tooling?.root.children).toEqual([]);
  });

  describe("tests layout", () => {
    async function describeTests(layout: string, extra: string[]) {
      const project = createTemporaryProject({
        "package.json": '{ "name": "project", "type": "module" }',
        "src/index.ts": "",
        "src/a/b/index.ts": "",
        ...record(
          ["tests/src/a/x.test.ts", "tests/fixtures/any/f.txt", ...extra].map(
            (file) => [file, ""],
          ),
        ),
        "engrenage.config.ts": `export default { tests: { layout: "${layout}" } };\n`,
      });

      const config = await loadConfig(project.root);
      const structure = config.structure.tests!;

      return {
        structure,
        nodes: new Map(
          flatten(structure.root).map((node) => [node.path, node]),
        ),
      };
    }

    test("mirror requires the counterpart of every directory below a root key", async () => {
      const { structure, nodes } = await describeTests("mirror", [
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

    test("roots accepts any directory below a root key", async () => {
      const { structure, nodes } = await describeTests("roots", [
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

    const { structure } = await loadConfig(project.root);

    const names = structure.tooling?.root.children.map(({ name }) => name);

    expect(names).toEqual(["eslint"]);
    expect(structure.tooling?.root.children.at(0)?.kind).toBe("domain");
  });
});

describe("inline roles", () => {
  const files = {
    "package.json": '{ "name": "project", "type": "module" }',
    "src/index.ts": "",
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
      flatten(config.structure.src!.root).map((node) => [node.path, node]),
    );
  }

  test("shadow a root role inside their owner only", async () => {
    const nodes = await describeProject(`{
      roles: {
        define: {
          game: { roles: [{ name: "types", exports: "default" }] },
        },
      },
    }`);

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
    await expect(
      describeProject(`{
        roles: {
          define: { game: { roles: [{ name: "types" }, { name: "types" }] } },
        },
      }`),
    ).rejects.toThrow("game lists the role types twice");

    const nodes = await describeProject(`{
      roles: {
        define: {
          game: { roles: [{ name: "types" }] },
          arcade: { roles: [{ name: "types" }] },
        },
      },
    }`);

    expect(nodes.get("src/x/game/types")).toMatchObject({
      role: "game/types",
    });
  });

  test("of a namespace are active only in its subtree", async () => {
    const nodes = await describeProject(`{
      src: {
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
