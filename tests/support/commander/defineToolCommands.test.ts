import { afterEach, describe, expect, test, vi } from "vitest";

import { defineToolCommands } from "#support/commander/utils/defineToolCommands";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { mockCwd } from "#tests/helpers/mockCwd";
import { runCommand } from "#tests/helpers/runCommand";

const commands = defineToolCommands({
  // @ts-expect-error
  packageName: "fake-tool",
  binary: "fake",
  commands: {
    "fake": {
      description: "Run the fake tool.",
      arguments(config, args) {
        args.unshift("--root", config.root);
      },
    },
    "fake:only": {
      description: "Run the fake tool with fixed arguments.",
      arguments() {
        return ["--only"];
      },
    },
    "fake:checked": {
      description: "Run the fake tool with messages.",
      message: "Checking fakes...",
    },
  },
});

const recordingBinary = [
  'import { writeFileSync } from "node:fs";',
  'writeFileSync(new URL("./args.json", import.meta.url), JSON.stringify(process.argv.slice(2)));',
  'process.exitCode = process.argv.includes("--pass") ? 0 : 3;',
  "",
].join("\n");

const fakeTool = {
  "node_modules/fake-tool/package.json": JSON.stringify({
    name: "fake-tool",
    bin: {
      fake: "./bin.mjs",
    },
  }),
  "node_modules/fake-tool/bin.mjs": recordingBinary,
};

function readRecordedArgs(project: ReturnType<typeof createProject>): unknown {
  return JSON.parse(project.read("node_modules/fake-tool/args.json"));
}

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
  vi.restoreAllMocks();

  process.exitCode = undefined;
});

describe("defineToolCommands", () => {
  test("runs the project binary with the arguments edited in place", async () => {
    const project = createProject(fakeTool);

    await runCommand(commands.fake, "--watch", "--", "src");

    expect(readRecordedArgs(project)).toEqual([
      "--root",
      project.root,
      "--watch",
      "--",
      "src",
    ]);
    expect(process.exitCode).toBe(3);
  });

  test("runs the project binary with the returned arguments only", async () => {
    const project = createProject(fakeTool);

    await runCommand(commands["fake:only"], "--watch");

    expect(readRecordedArgs(project)).toEqual(["--only"]);
  });

  test("announces the command and reports success only when the binary passes", async () => {
    createProject(fakeTool);

    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    await runCommand(commands["fake:checked"], "--pass");

    expect(info.mock.calls).toEqual([["Checking fakes..."], ["All good!"]]);

    info.mockClear();

    await runCommand(commands["fake:checked"]);

    expect(info.mock.calls).toEqual([["Checking fakes..."]]);
    expect(process.exitCode).toBe(3);
  });

  test("names the package to install when the project lacks it", async () => {
    createProject();

    await expect(runCommand(commands.fake)).rejects.toThrow(
      "Install fake-tool in",
    );
  });
});
