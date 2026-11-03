import { Command } from "@commander-js/extra-typings";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { sync } from "#bin/engrenage/sync";
import { addDebugOption } from "#support/commander/utils/addDebugOption";
import { defineCommand } from "#support/commander/utils/defineCommand";
import { registerSubcommands } from "#support/commander/utils/registerSubcommands";
import { runProgram } from "#support/commander/utils/runProgram";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { mockCwd } from "#tests/helpers/mockCwd";

const failing = defineCommand((command) => {
  return command.action(() => {
    throw new Error("outer", { cause: new Error("inner") });
  });
});

function createProgram() {
  const program = registerSubcommands(new Command("program"), { failing });

  addDebugOption(program);

  return program;
}

function run(program: Command, ...args: string[]) {
  return runProgram(program, ["node", "program", ...args]);
}

function printed() {
  return vi.mocked(console.error).mock.calls.map(String).join("\n");
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});

  mockCwd(createTemporaryProject({ "package.json": "{}" }).root);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();

  process.exitCode = undefined;
});

describe("runProgram", () => {
  test("prints the message and its causes without a stack", async () => {
    await run(createProgram(), "failing");

    expect(printed()).toContain("outer\nCaused by: inner");
    expect(printed()).not.toContain("    at ");
    expect(process.exitCode).toBe(1);
  });

  test.each([
    ["--debug", "failing"],
    ["failing", "--debug"],
  ])("prints the stack with the flag (%s %s)", async (...argv) => {
    await run(createProgram(), ...argv);

    expect(printed()).toContain("    at ");
  });

  test("prints the stack with the environment variable", async () => {
    vi.stubEnv("ENGRENAGE_DEBUG", "1");

    await run(createProgram(), "failing");

    expect(printed()).toContain("    at ");
  });

  test("prints the stack with debug in the config", async () => {
    mockCwd(
      createTemporaryProject({
        "package.json": "{}",
        "engrenage.config.ts": "export default { debug: true };",
      }).root,
    );

    await run(createProgram(), "failing");

    expect(printed()).toContain("    at ");
  });

  test("prints the validation summary of an invalid config without a stack", async () => {
    mockCwd(
      createTemporaryProject({
        "package.json": "{}",
        "engrenage.config.ts": "export default { unknown: true };",
      }).root,
    );

    await run(registerSubcommands(new Command("program"), { sync }), "sync");

    expect(printed()).toContain("Invalid");
    expect(printed()).not.toContain("    at ");
    expect(process.exitCode).toBe(1);
  });
});
