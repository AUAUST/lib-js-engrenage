import { afterEach, describe, expect, test, vi } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { runDefinition } from "#tests/utils/runDefinition";
import { defineToolCommand } from "#workflows/cli/index";

function defineFakeCommand(
  action: (args: string[]) => readonly string[],
  message?: string,
) {
  return defineToolCommand({
    // @ts-expect-error
    packageName: "fake-tool",
    binary: "fake",
    ...(message === undefined ? {} : { message }),
    action() {
      return Promise.resolve(action);
    },
  });
}

const commands = {
  fake: defineFakeCommand((args) => {
    return ["--root", process.cwd(), ...args];
  }),
  fakeOnly: defineFakeCommand(() => ["--only"]),
  fakeChecked: defineFakeCommand((args) => args, "Checking fakes..."),
};

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
});

describe("defineToolCommand", () => {
  test("runs the project binary with the raw arguments its action resolves", async () => {
    const project = createProject(fakeTool);

    await runDefinition(commands.fake, "--watch", "--", "src");

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

    await runDefinition(commands.fakeOnly, "--watch");

    expect(readRecordedArgs(project)).toEqual(["--only"]);
  });

  test("announces the command and reports success only when the binary passes", async () => {
    createProject(fakeTool);

    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    await runDefinition(commands.fakeChecked, "--pass");

    expect(info.mock.calls).toEqual([["Checking fakes..."], ["All good!"]]);

    info.mockClear();

    await runDefinition(commands.fakeChecked);

    expect(info.mock.calls).toEqual([["Checking fakes..."]]);
    expect(process.exitCode).toBe(3);
  });

  test("names the package to install when the project lacks it", async () => {
    createProject();

    await expect(runDefinition(commands.fake)).rejects.toThrow(
      "Install fake-tool in",
    );
  });
});
