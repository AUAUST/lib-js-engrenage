import { afterEach, describe, expect, test } from "vitest";

import { defineToolCommands } from "#support/commander/utils/defineToolCommands";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { mockCwd } from "#tests/helpers/mockCwd";
import { runCommand } from "#tests/helpers/runCommand";

const { fake } = defineToolCommands({
  packageName: "fake-tool",
  binary: "fake",
  commands: {
    fake: {
      description: "Run the fake tool.",
      arguments(config) {
        return ["--root", config.root];
      },
    },
  },
});

const recordingBinary = [
  'import { writeFileSync } from "node:fs";',
  'writeFileSync(new URL("./args.json", import.meta.url), JSON.stringify(process.argv.slice(2)));',
  "process.exitCode = 3;",
  "",
].join("\n");

function createProject(files: Record<string, string> = {}) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({
      type: "module",
    }),
    "engrenage.config.ts": "export default {};\n",
    ...files,
  });

  mockCwd(project.root);

  return project;
}

afterEach(() => {
  process.exitCode = undefined;
});

describe("defineToolCommands", () => {
  test("runs the project binary with the configured and given arguments", async () => {
    const project = createProject({
      "node_modules/fake-tool/package.json": JSON.stringify({
        name: "fake-tool",
        bin: {
          fake: "./bin.mjs",
        },
      }),
      "node_modules/fake-tool/bin.mjs": recordingBinary,
    });

    await runCommand(fake, "--watch", "--", "src");

    expect(
      JSON.parse(project.read("node_modules/fake-tool/args.json")),
    ).toEqual(["--root", project.root, "--watch", "--", "src"]);
    expect(process.exitCode).toBe(3);
  });

  test("names the package to install when the project lacks it", async () => {
    createProject();

    await expect(runCommand(fake)).rejects.toThrow("Install fake-tool in");
  });
});
