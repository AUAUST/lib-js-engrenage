import { mkdirSync } from "node:fs";

import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage/config";
import { record } from "@auaust/toolkit/object";

import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";

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
});
