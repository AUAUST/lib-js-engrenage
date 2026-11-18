import { afterEach, beforeEach, vi } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";
import { mockCwd } from "#tests/utils/mockCwd";
import {
  createProgram as createDefinedProgram,
  defineCommand,
  defineGroup,
} from "#workflows/cli/index";

const failing = defineCommand({
  action() {
    throw new Error("outer", { cause: new Error("inner") });
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
      "program",
      defineGroup({
        commands: { failing },
      }),
    );
  }

  function printed() {
    return reporter.messages
      .filter(({ level }) => level === "error")
      .map(({ text }) => text)
      .join("\n");
  }

  return {
    getReporter,
    createProgram,
    printed,
  };
}
