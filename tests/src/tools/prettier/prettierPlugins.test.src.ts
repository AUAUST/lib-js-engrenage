import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { formatChanges } from "#project/sync/index";
import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getExecutable } from "#tests/utils/getExecutable";
import { linkPrettier } from "#tests/utils/linkPrettier";
import { linkSourcePackage } from "#tests/utils/linkSourcePackage";
import { mockCwd } from "#tests/utils/mockCwd";

const run = promisify(execFile);

const fixtureConfig = `const plugin = {
  parsers: {
    fixture: {
      astFormat: "fixture-ast",
      parse: (text) => ({ value: text }),
      locStart: () => 0,
      locEnd: () => 0,
    },
  },
  printers: {
    "fixture-ast": {
      print: (path) => path.node.value.toUpperCase(),
    },
  },
};

export default {
  extensions: [
    {
      name: "prettier-plugin-fixture",
      contributes: {
        "prettier.plugins": [
          {
            name: "prettier-plugin-fixture",
            files: ["*.fixture"],
            options: { parser: "fixture" },
            load: async () => plugin,
          },
        ],
      },
    },
  ],
};
`;

function createProject() {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({
      type: "module",
      prettier: "@auaust/engrenage/prettier",
      devDependencies: { prettier: "*" },
    }),
    "engrenage.config.ts": fixtureConfig,
    "note.fixture": "shout\n",
  });

  linkPrettier(project.resolve("node_modules/prettier"));

  linkSourcePackage(project.resolve("node_modules/@auaust/engrenage"));

  mockCwd(project.root);

  return project;
}

describe("prettier.plugins", { timeout: binaryTimeout }, () => {
  test("formats a contributed plugin's files through engrenage prettier", async () => {
    const project = createProject();

    await run(process.execPath, [getExecutable(), "prettier", "note.fixture"], {
      cwd: project.root,
    });

    expect(project.read("note.fixture")).toBe("SHOUT\n");
  });

  test("formats a contributed plugin's files through sync's formatChanges", async () => {
    const project = createProject();

    const config = await loadConfig(project.root);

    await config.context.filesystem.write("note.fixture", "whisper\n");

    await formatChanges(config);

    await config.context.filesystem.flush();

    expect(project.read("note.fixture")).toBe("WHISPER\n");
  });
});
