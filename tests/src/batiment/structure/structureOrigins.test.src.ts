import { describe, expect, test } from "vitest";

import {
  collectStructureNodes,
  flattenStructure,
  listDeclaredOptionPaths,
} from "#batiment/structure/index";
import { createProjectConfig } from "#project/config/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { withSourceRuntime } from "#tests/utils/withSourceRuntime";

const files = {
  "package.json": '{ "name": "project", "type": "module" }',
  "src/entry.ts": "",
  "src/feature/index.ts": "",
  "src/group/one/index.ts": "",
};

async function resolveSource({
  preset = {},
  input = {},
  extra = {},
}: {
  preset?: Readonly<Record<string, unknown>>;
  input?: Readonly<Record<string, unknown>>;
  extra?: Readonly<Record<string, string>>;
}) {
  const fixture = {
    name: "structure-origins-fixture",
    contributes: {
      presets: [
        {
          name: "fixture",
          traits: [],
          load() {
            return Promise.resolve(preset);
          },
        },
      ],
    },
  };

  const config = createProjectConfig({
    root: createTemporaryProject({ ...files, ...extra }).root,
    raw: withSourceRuntime({
      extensions: [fixture],
      preset: "fixture",
      ...input,
    }),
    configFile: undefined,
  });

  const { src } = await config.resolve("structure");

  if (src === undefined) {
    throw new Error("The fixture resolves no src structure");
  }

  return {
    blocking: src.diagnostics.filter(({ blocking }) => blocking === true),
    nodes: new Map(
      collectStructureNodes(src.root).map((node) => [node.path, node]),
    ),
  };
}

const domainMetafile = {
  "src/feature/.domain.json": '{ "purpose": "From the metafile." }',
};

const namespaceMetafile = {
  "src/group/one/.namespace.json": '{ "purpose": "From the metafile." }',
};

describe("structure origins", () => {
  test("a metafile field overrides the preset's silently", async () => {
    const { blocking, nodes } = await resolveSource({
      preset: {
        "src.structure": {
          domains: {
            feature: { purpose: "From the preset." },
          },
        },
      },
      extra: domainMetafile,
    });

    expect(blocking).toEqual([]);
    expect(nodes.get("src/feature")?.purpose).toBe("From the metafile.");
  });

  test("a metafile kind overrides the preset's silently, and conflicts with the input's", async () => {
    const structure = {
      namespaces: {
        feature: {},
      },
    };

    const preset = await resolveSource({
      preset: { "src.structure": structure },
      extra: domainMetafile,
    });

    expect(preset.blocking).toEqual([]);

    expect(preset.nodes.get("src/feature")).toMatchObject({
      kind: "domain",
      source: "metadata",
    });

    const input = await resolveSource({
      input: {
        src: { structure },
      },
      extra: domainMetafile,
    });

    expect(input.blocking).toMatchObject([
      {
        code: "config-metafile-kind",
        severity: "error",
        blocking: true,
        config: {
          origin: { layer: "input" },
        },
      },
    ]);
  });

  test("a metafile namespace under preset domain children passes silently, and conflicts with input ones", async () => {
    const structure = {
      namespaces: {
        group: { children: "domains" },
      },
    };

    const preset = await resolveSource({
      preset: { "src.structure": structure },
      extra: namespaceMetafile,
    });

    expect(preset.blocking).toEqual([]);
    expect(preset.nodes.get("src/group/one")?.kind).toBe("namespace");

    const input = await resolveSource({
      input: {
        src: { structure },
      },
      extra: namespaceMetafile,
    });

    expect(input.blocking).toMatchObject([
      {
        code: "children-domains-namespace",
        severity: "error",
        blocking: true,
        config: {
          origin: { layer: "input" },
        },
      },
    ]);
  });

  test("an invalid metafile is reported and ignored", async () => {
    const without = await resolveSource({});

    const { blocking, nodes } = await resolveSource({
      extra: { "src/group/.namespace.json": '{ "layers": 1 }' },
    });

    expect(blocking).toMatchObject([
      {
        code: "invalid-metafile",
        severity: "error",
        files: ["src/group/.namespace.json"],
      },
    ]);

    expect(nodes.get("src/group")).toEqual(without.nodes.get("src/group"));
  });

  test("every declared node and field has an option path to read its origin from", () => {
    const declared = flattenStructure({
      environment: "src",
      root: "src.structure",
      structure: {
        purpose: undefined,
        layers: undefined,
        relation: undefined,
        children: "domains",
        roles: {
          enable: [],
        },
        namespaces: {},
        domains: {
          feature: {
            specifier: undefined,
            purpose: "Feature.",
            internals: undefined,
            reexport: undefined,
            collects: undefined,
            public: undefined,
            namespaces: {},
            domains: {},
          },
        },
      },
      published: false,
    });

    expect(
      listDeclaredOptionPaths({
        declared,
        optionPaths: declared.optionPaths,
      }),
    ).toEqual(
      expect.arrayContaining([
        "src.structure",
        "src.structure.children",
        "src.structure.domains.feature",
        "src.structure.domains.feature.purpose",
      ]),
    );
  });
});
