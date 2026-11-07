import { describe, expect, test } from "vitest";

import { loadConfig, sourceExportsSection } from "@auaust/engrenage";
import { entry } from "@auaust/engrenage/roles";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { renderCodeRoles } from "#tests/utils/renderCodeRoles";

const files = {
  "package.json": '{ "name": "project", "type": "module" }',
  "src/entry.ts": "",
  "src/tools/alpha/index.ts": "",
  "src/tools/alpha/entry.ts": "",
  "src/tools/beta/index.ts": "",
  "src/tools/beta/entry.ts": "",
  "src/tools/beta/inner/index.ts": "",
  "src/project/model/index.ts": "",
  "src/project/model/entry.ts": "",
  "src/hidden/index.ts": "",
};

async function exposed(
  source: string,
  extra: Record<string, string> = {},
  roles = renderCodeRoles(entry()),
) {
  const project = createTemporaryProject({
    ...files,
    ...extra,
    "engrenage.config.ts": `export default { preset: "library", src: { roles: ${roles}, ...${source} } };\n`,
  });

  const config = await loadConfig(project.root);

  return config.resolve(sourceExportsSection);
}

describe("domain entries", () => {
  test("a domain holding an entry exposes it by its path without namespaces, one without nothing", async () => {
    expect(
      await exposed(`{
        namespaces: { tools: {}, project: {} },
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
        `{ namespaces: { tools: {}, project: {} } }`,
        { "src/tools/beta/exports.ts": "" },
        renderCodeRoles(entry({ purpose: "Entry.", file: ["exports.ts"] })),
      ),
    ).toEqual({ "./beta": "src/tools/beta/exports.ts" });
  });

  test("a declared specifier replaces the derived one", async () => {
    expect(
      await exposed(`{
        namespaces: { tools: {} },
        domains: { "tools/alpha": { specifier: "./first" } },
      }`),
    ).toMatchObject({ "./first": "src/tools/alpha/entry.ts" });
  });

  test("two public domains with one specifier fail", async () => {
    await expect(
      exposed(`{
        namespaces: { tools: {} },
        domains: {
          "tools/alpha": { specifier: "./same" },
          "tools/beta": { specifier: "./same" },
        },
      }`),
    ).rejects.toThrow("share the specifier './same'");
  });

  test("a subpath both derived from a public domain and listed in src.exports fails", async () => {
    await expect(
      exposed(`{
        namespaces: { tools: {} },
        exports: { "./alpha": "src/hidden/index.ts" },
      }`),
    ).rejects.toThrow("Subpath './alpha' is exposed by src.exports");
  });
});

describe("internal specifiers", () => {
  test("@auaust/engrenage/project/structure resolves in neither mode", () => {
    expect(() => {
      import.meta.resolve("@auaust/engrenage/project/structure");
    }).toThrow();
  });
});
