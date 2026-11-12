import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage/extensions";
import { createRolePreset, entry } from "@auaust/engrenage/roles";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { renderCodeRoles } from "#tests/utils/renderCodeRoles";

const files = {
  "package.json": '{ "name": "project", "type": "module" }',
  "src/tools/alpha/index.ts": "",
  "src/tools/alpha/entry.ts": "",
  "src/tools/beta/index.ts": "",
  "src/tools/beta/entry.ts": "",
  "src/tools/beta/inner/index.ts": "",
  "src/project/model/index.ts": "",
  "src/project/model/entry.ts": "",
  "src/hidden/index.ts": "",
};

const rootEntry = { "src/entry.ts": "" };

async function exposed(
  source: string,
  extra: Record<string, string> = {},
  roles = renderCodeRoles(entry()),
  structure = "{}",
) {
  const project = createTemporaryProject({
    ...files,
    ...extra,
    "engrenage.config.ts": `export default { preset: "library", structure: ${structure}, src: { roles: ${roles}, ...${source} } };\n`,
  });

  const config = await loadConfig(project.root);

  return config.resolve("src.exports");
}

function barrelRole(subpath: boolean | "root" = true) {
  return createRolePreset({
    name: "models",
    index: true,
    public: true,
    subpath,
  })();
}

describe("domain entries", () => {
  test("a domain holding an entry exposes it by its path without namespaces, one without nothing", async () => {
    expect(
      await exposed(`{
        structure: { namespaces: { tools: {}, project: {} } },
      }`),
    ).toEqual({
      "./alpha": "src/tools/alpha/entry.ts",
      "./beta": "src/tools/beta/entry.ts",
      "./model": "src/project/model/entry.ts",
    });
  });

  test("the entry role's file names the entry of a domain", async () => {
    expect(
      await exposed(
        `{ structure: { namespaces: { tools: {}, project: {} } } }`,
        { "src/tools/beta/exports.ts": "" },
        renderCodeRoles(entry({ purpose: "Entry.", file: ["exports.ts"] })),
      ),
    ).toEqual({ "./beta": "src/tools/beta/exports.ts" });
  });

  test("a declared specifier replaces the derived one", async () => {
    expect(
      await exposed(`{
        structure: {
          namespaces: { tools: { domains: { alpha: { specifier: "./first" } } } },
        },
      }`),
    ).toMatchObject({ "./first": "src/tools/alpha/entry.ts" });
  });

  test("two public domains with one specifier fail", async () => {
    await expect(
      exposed(`{
        structure: {
          namespaces: {
            tools: {
              domains: {
                alpha: { specifier: "./same" },
                beta: { specifier: "./same" },
              },
            },
          },
        },
      }`),
    ).rejects.toThrow("share the specifier './same'");
  });

  test("a subpath both derived from a public domain and listed in src.exports fails", async () => {
    await expect(
      exposed(`{
        structure: { namespaces: { tools: {} } },
        exports: { "./alpha": "src/hidden/index.ts" },
      }`),
    ).rejects.toThrow("Subpath './alpha' is exposed by src.exports");
  });

  test("a subpath role exposes each of its files in a public domain only", async () => {
    expect(
      await exposed(
        `{ structure: { namespaces: { tools: {}, project: {} } } }`,
        {
          "src/tools/alpha/constants.ts": "",
          "src/hidden/constants.ts": "",
        },
      ),
    ).toEqual({
      "./alpha": "src/tools/alpha/entry.ts",
      "./alpha/constants": "src/tools/alpha/constants.ts",
      "./beta": "src/tools/beta/entry.ts",
      "./model": "src/project/model/entry.ts",
    });
  });

  test("a src.exports line naming a role subpath fails naming both files", async () => {
    await expect(
      exposed(
        `{
          structure: { namespaces: { tools: {} } },
          exports: { "./alpha/constants": "src/hidden/index.ts" },
        }`,
        { "src/tools/alpha/constants.ts": "" },
      ),
    ).rejects.toThrow(
      "Subpath './alpha/constants' is exposed by src.exports, as src/hidden/index.ts, and by src/tools/alpha/constants.ts",
    );
  });

  test("a subpath role with an index exposes its barrel", async () => {
    expect(
      await exposed(
        `{ structure: { namespaces: { tools: {}, project: {} } } }`,
        { "src/models/index.ts": "" },
        renderCodeRoles(entry(), barrelRole()),
      ),
    ).toMatchObject({ "./models": "src/models/index.ts" });
  });

  test("a subpath directory role without an index fails naming the role", async () => {
    await expect(
      exposed(
        "{}",
        {},
        renderCodeRoles(
          entry(),
          createRolePreset({
            name: "shapes",
            public: true,
            subpath: true,
          })(),
        ),
      ),
    ).rejects.toThrow("The role shapes sets `subpath` without");
  });

  test("a src.exports line naming a role barrel subpath fails naming both", async () => {
    await expect(
      exposed(
        `{ exports: { "./models": "src/hidden/index.ts" } }`,
        { "src/models/index.ts": "" },
        renderCodeRoles(entry(), barrelRole()),
      ),
    ).rejects.toThrow(
      "Subpath './models' is exposed by src.exports, as src/hidden/index.ts, and by src/models/index.ts",
    );
  });

  test("a root subpath role exposes its barrel at the environment root only", async () => {
    const found = await exposed(
      `{ structure: { domains: { d: { public: true } } } }`,
      {
        "src/models/index.ts": "",
        "src/d/index.ts": "",
        "src/d/entry.ts": "",
        "src/d/models/index.ts": "",
      },
      renderCodeRoles(entry(), barrelRole("root")),
    );

    expect(found).toMatchObject({
      "./d": "src/d/entry.ts",
      "./models": "src/models/index.ts",
    });

    expect(found).not.toHaveProperty(["./d/models"]);
  });

  test("a subpath file role exposes its file at the environment root", async () => {
    expect(await exposed("{}", { "src/constants.ts": "" })).toMatchObject({
      "./constants": "src/constants.ts",
    });
  });

  test("a root subpath role that is not public fails naming the role", async () => {
    await expect(
      exposed(
        "{}",
        {},
        renderCodeRoles(
          entry(),
          createRolePreset({
            name: "models",
            index: true,
            subpath: "root",
          })(),
        ),
      ),
    ).rejects.toThrow("The role models sets `subpath` but is not public");
  });

  test("the environment root's entry is exposed as the package root without a src.exports line", async () => {
    expect(await exposed("{}", rootEntry)).toMatchObject({
      ".": "src/entry.ts",
    });
  });

  test("a src.exports line naming the package root beside the root entry fails", async () => {
    await expect(
      exposed(`{ exports: { ".": "src/hidden/index.ts" } }`, rootEntry),
    ).rejects.toThrow(
      "Subpath '.' is exposed by src.exports, as src/hidden/index.ts, and by src/entry.ts",
    );
  });

  test("an environment root without an entry exposes no package root", async () => {
    expect(
      await exposed(`{ structure: { namespaces: { tools: {} } } }`),
    ).not.toHaveProperty(["."]);
  });

  test("structure.internals exposes every domain's index under /internals unless the domain opts out", async () => {
    expect(
      await exposed(
        `{
          structure: {
            namespaces: {
              tools: {},
              project: { domains: { model: { internals: false } } },
            },
          },
        }`,
        {},
        renderCodeRoles(entry()),
        "{ internals: true }",
      ),
    ).toEqual({
      "./alpha": "src/tools/alpha/entry.ts",
      "./alpha/internals": "src/tools/alpha/index.ts",
      "./beta": "src/tools/beta/entry.ts",
      "./beta/internals": "src/tools/beta/index.ts",
      "./beta/inner/internals": "src/tools/beta/inner/index.ts",
      "./model": "src/project/model/entry.ts",
      "./hidden/internals": "src/hidden/index.ts",
    });
  });

  test("an /internals subpath colliding with a declared specifier fails naming both domains", async () => {
    await expect(
      exposed(
        `{
          structure: {
            namespaces: {
              tools: { domains: { beta: { specifier: "./alpha/internals" } } },
            },
          },
        }`,
        {},
        renderCodeRoles(entry()),
        "{ internals: true }",
      ),
    ).rejects.toThrow(
      /src\/tools\/alpha\/index\.ts and src\/tools\/beta\/entry\.ts|src\/tools\/beta\/entry\.ts and src\/tools\/alpha\/index\.ts/,
    );
  });
});

describe("internal specifiers", () => {
  test("@auaust/engrenage/project/structure resolves in neither mode", () => {
    expect(() => {
      import.meta.resolve("@auaust/engrenage/project/structure");
    }).toThrow();
  });
});
