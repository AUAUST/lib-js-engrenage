import { afterEach, beforeEach, vi } from "vitest";

import {
  command,
  createProgram as createDefinedProgram,
} from "#nexus/cli/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";
import { mockCwd } from "#tests/utils/mockCwd";

const failing = command({
  name: "failing",
  action() {
    return Promise.resolve(() => {
      throw new Error("outer", { cause: new Error("inner") });
    });
  },
});

export function useFailingProgram() {
  let reporter = createTestReporter();

  beforeEach(() => {
    reporter = createTestReporter();

    mockCwd(createTemporaryProject({ "package.json": "{}" }).root);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();

    process.exitCode = undefined;
  });

  function getReporter() {
    return reporter;
  }

  function createProgram() {
    return createDefinedProgram(
      command({ name: "program", subcommands: [failing] }),
    );
  }

  function printed() {
    return reporter.messages.map(({ text }) => text).join("\n");
  }

  return {
    getReporter,
    createProgram,
    printed,
  };
}
