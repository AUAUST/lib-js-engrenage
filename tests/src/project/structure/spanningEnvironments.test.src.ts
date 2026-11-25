import { ESLint } from "eslint";
import {
  createProgram,
  flattenDiagnosticMessageText,
  getParsedCommandLineOfConfigFile,
  getPreEmitDiagnostics,
  sys,
} from "typescript";
import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { linkPackage } from "#tests/utils/linkPackage";
import { createEslintConfig } from "#tools/eslint/index";
import { syncAliases } from "#tools/typescript/setup/syncAliases";
import { syncTsconfigFiles } from "#tools/typescript/setup/syncTsconfigFiles";

const exported = "export const value = 1;\n";

function createInterscriptProject() {
  const project = createTemporaryProject({
    "package.json": '{ "name": "project", "type": "module" }',
    "tsconfig.json": "{}",
    "engrenage.config.ts": `export default { environments: { src: { dirs: ["src"], execution: { globals: "node", syntax: 24 }, bundled: true }, admin: { preset: "src", dirs: ["admin"], languages: [{ name: "typescript", options: { tsx: "preact" } }], execution: { globals: "browser", syntax: "2026-10" } } }, src: { dirs: ["src", "admin"] } };\n`,
    "src/core/index.ts": exported,
    "admin/ui/index.ts": exported,
    "admin/ui/utils/priv.ts": exported,
    "admin/ui/components/Panel.tsx": "export function Panel() {\n  return <div />;\n}\n",
    "tests/panel.test.ts": 'import { Panel } from "#ui/components/Panel";\n\nPanel();\n',
    "node_modules/preact/package.json": '{ "name": "preact", "exports": { "./jsx-runtime": { "types": "./jsx-runtime.d.ts" } } }',
    "node_modules/preact/jsx-runtime.d.ts": "export namespace JSX {\n  interface Element {}\n  interface IntrinsicElements {\n    [name: string]: object;\n  }\n}\n\nexport function jsx(type: string, props: object): JSX.Element;\n",
  });

  for (const name of ["@auaust/engrenage", "@types/node"]) {
    linkPackage(name, project.resolve(`node_modules/${name}`));
  }

  return project;
}

function listDiagnostics(tsconfig: string) {
  const parsed = getParsedCommandLineOfConfigFile(tsconfig, undefined, {
    ...sys,
    onUnRecoverableConfigFileDiagnostic({ messageText }) {
      throw new Error(flattenDiagnosticMessageText(messageText, "\n"));
    },
  });

  if (parsed === undefined) {
    throw new Error(`${tsconfig} parses to no command line`);
  }

  const program = createProgram(parsed.fileNames, {
    ...parsed.options,
    noEmit: true,
  });

  return [...parsed.errors, ...getPreEmitDiagnostics(program)].map(
    ({ messageText }) => {
      return flattenDiagnosticMessageText(messageText, "\n");
    },
  );
}

describe("namespaces spanning several environments", () => {
  test("resolve each environment's modules through their aliases, type-check them under their own settings and boundary-check imports across directories", async () => {
    const project = createInterscriptProject();

    const config = await loadConfig(project.root);

    await syncAliases(config);

    await syncTsconfigFiles(config);

    await config.context.filesystem.flush();

    expect(JSON.parse(project.read("package.json")).imports["#ui/*"]).toEqual({
      types: ["./admin/ui/*.ts", "./admin/ui/*.tsx"],
      default: "./admin/ui/*",
    });

    expect(listDiagnostics(project.resolve("tsconfig.tests.json"))).toEqual([]);

    loadConfig.refresh(project.root);

    const eslint = new ESLint({
      cwd: project.root,
      overrideConfigFile: true,
      overrideConfig: await createEslintConfig(await loadConfig(project.root), {
        typeAware: false,
      }),
    });

    const [result] = await eslint.lintText(
      'export { value } from "#ui/utils/priv";\n',
      { filePath: project.resolve("src/core/index.ts") },
    );

    expect(result?.messages.map(({ ruleId }) => ruleId)).toContain(
      "auaust/import-surfaces",
    );
  });
});
