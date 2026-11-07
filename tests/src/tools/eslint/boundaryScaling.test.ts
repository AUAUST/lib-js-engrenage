import { performance } from "node:perf_hooks";

import { ESLint } from "eslint";
import { expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage/config";
import { createEslintConfig } from "@auaust/engrenage/eslint";
import { record } from "@auaust/toolkit/object";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

const namespaces = ["foundation", "project"] as const;

function createProject(domains: number) {
  const perNamespace = domains / namespaces.length;

  const files = namespaces.flatMap((namespace) => {
    return Array.from({ length: perNamespace }, (_, index) => {
      const domain = `src/${namespace}/d${index}`;
      const peer = `#${namespace}/d${(index + 1) % perNamespace}/index`;

      return [
        [
          `${domain}/index.ts`,
          `export { value } from "#${namespace}/d${index}/utils/a";\nexport { value as peer } from "${peer}";\n`,
        ],
        [`${domain}/utils/a.ts`, "export const value = 1;\n"],
      ] as const;
    }).flat();
  });

  return createTemporaryProject({
    "package.json": JSON.stringify({
      name: "library",
      type: "module",
      imports: record(
        namespaces.map((namespace) => {
          return [`#${namespace}/*`, `./src/${namespace}/*.ts`] as const;
        }),
      ),
    }),
    "engrenage.config.ts": `export default { preset: "library", src: { namespaces: { ".": { layers: ${JSON.stringify(namespaces)} } } } };\n`,
    "tsconfig.json": "{}",
    ...record(files),
  });
}

async function timeLint(domains: number): Promise<number> {
  const project = createProject(domains);

  const eslint = new ESLint({
    cwd: project.root,
    overrideConfigFile: true,
    overrideConfig: await createEslintConfig(await loadConfig(project.root), {
      typeAware: false,
    }),
    ruleFilter: ({ ruleId }) => ruleId.startsWith("auaust/import-"),
  });

  const start = performance.now();
  const results = await eslint.lintFiles(["src"]);
  const duration = performance.now() - start;

  expect(results.flatMap(({ messages }) => messages)).toEqual([]);

  return duration;
}

test("lint time of the import rules grows linearly with the domains", async () => {
  const small = await timeLint(10);
  const large = await timeLint(80);

  expect(large).toBeLessThan(small * 16);
}, 120_000);
