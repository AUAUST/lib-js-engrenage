import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

const files = {
  "package.json": '{ "name": "project", "type": "module" }',
  "src/index.ts": "",
  "src/tools/alpha/index.ts": "",
  "src/tools/beta/index.ts": "",
  "src/tools/beta/inner/index.ts": "",
  "src/project/model/index.ts": "",
  "src/hidden/index.ts": "",
};

async function exposed(source: string) {
  const project = createTemporaryProject({
    ...files,
    "engrenage.config.ts": `export default { src: ${source} };\n`,
  });

  return (await loadConfig(project.root)).src.exports;
}

describe("domain entries", () => {
  test("a public domain exposes its index by its path without namespaces, an internal one nothing", async () => {
    expect(
      await exposed(`{
        namespaces: { tools: {}, project: {} },
        domains: { "tools/*": { public: true }, "project/model": { public: true } },
      }`),
    ).toEqual({
      "./alpha": "src/tools/alpha/index.ts",
      "./beta": "src/tools/beta/index.ts",
      "./model": "src/project/model/index.ts",
    });
  });

  test("a declared specifier replaces the derived one", async () => {
    expect(
      await exposed(`{
        namespaces: { tools: {} },
        domains: { "tools/alpha": { public: true, specifier: "./first" } },
      }`),
    ).toEqual({ "./first": "src/tools/alpha/index.ts" });
  });

  test("two public domains with one specifier fail", async () => {
    await expect(
      exposed(`{
        namespaces: { tools: {} },
        domains: {
          "tools/alpha": { public: true, specifier: "./same" },
          "tools/beta": { public: true, specifier: "./same" },
        },
      }`),
    ).rejects.toThrow("share the specifier './same'");
  });
});

describe("internal specifiers", () => {
  test("@auaust/engrenage/project/structure resolves in neither mode", () => {
    expect(() => {
      import.meta.resolve("@auaust/engrenage/project/structure");
    }).toThrow();
  });
});
