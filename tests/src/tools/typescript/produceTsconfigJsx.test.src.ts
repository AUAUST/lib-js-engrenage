import { join } from "node:path";

import {
  createProgram,
  flattenDiagnosticMessageText,
  getParsedCommandLineOfConfigFile,
  getPreEmitDiagnostics,
  sys,
} from "typescript";
import { describe, expect, test } from "vitest";

import { createProjectConfig } from "#project/config/operations/createProjectConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { withSourceRuntime } from "#tests/utils/withSourceRuntime";
import { syncTsconfigFiles } from "#tools/typescript/setup/syncTsconfigFiles";

const jsxNotSet = 6142;

function preact() {
  return [
    {
      name: "typescript",
      options: { tsx: "preact" },
    },
  ];
}

async function syncProject(
  environments: Record<string, unknown>,
  files: Record<string, string> = {},
) {
  const project = createTemporaryProject({
    "package.json": "{}",
    "tsconfig.json": "{}",
    "src/index.ts": "",
    "admin/ui/Panel.tsx": "export const Panel = () => <div />;\n",
    "tests/admin.test.ts": 'import { Panel } from "../admin/ui/Panel";\n\nPanel();\n',
    ...files,
  });

  const config = createProjectConfig({
    root: project.root,
    raw: withSourceRuntime({
      environments: {
        src: {
          dirs: ["src"],
        },
        admin: {
          preset: "src",
          dirs: ["admin"],
          languages: preact(),
          execution: { syntax: "2026-10" },
        },
        ...environments,
      },
      src: {
        dirs: ["src", "admin"],
      },
    }),
    configFile: undefined,
  });

  await syncTsconfigFiles(config);

  await config.context.filesystem.flush();

  return {
    read(file: string) {
      return JSON.parse(project.read(file));
    },
    listDiagnosticCodes(tsconfig: string) {
      const parsed = getParsedCommandLineOfConfigFile(
        join(project.root, tsconfig),
        undefined,
        {
          ...sys,
          onUnRecoverableConfigFileDiagnostic({ messageText }) {
            throw new Error(flattenDiagnosticMessageText(messageText, "\n"));
          },
        },
      );

      if (parsed === undefined) {
        throw new Error(`${tsconfig} parses to no command line`);
      }

      const program = createProgram(parsed.fileNames, {
        ...parsed.options,
        noEmit: true,
      });

      return getPreEmitDiagnostics(program).map(({ code }) => code);
    },
  };
}

describe("produceTsconfigJsx", () => {
  test("gives an environment the JSX settings of another environment whose modules it may import", async () => {
    const { read, listDiagnosticCodes } = await syncProject({});

    expect(read("tsconfig.tests.json").compilerOptions).toMatchObject({
      jsx: "react-jsx",
      jsxImportSource: "preact",
    });

    expect(listDiagnosticCodes("tsconfig.tests.json")).not.toContain(jsxNotSet);
  });

  test("fails when the environments an environment may import set different JSX flavours", async () => {
    await expect(
      syncProject({
        tests: {
          languages: [
            {
              name: "typescript",
              options: { tsx: "solid" },
            },
          ],
        },
      }),
    ).rejects.toThrow(/tests.*preact.*solid|tests.*solid.*preact/);
  });
});
