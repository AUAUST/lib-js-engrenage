import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { config } from "#scripts/support/codegen/config";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { mockCwd } from "#tests/helpers/mockCwd";
import { runCommand } from "#tests/helpers/runCommand";

const file = "src/project/config/types/Config.ts";

beforeEach(() => {
  vi.spyOn(console, "info").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  process.exitCode = undefined;
});

describe("support codegen config", () => {
  test("passes the check on the committed interface", async () => {
    await runCommand(config, "--check");

    expect(process.exitCode).toBeUndefined();
  });

  test("fails the check on an interface that no longer matches the schema descriptions", async () => {
    const project = createTemporaryProject({
      "package.json": JSON.stringify({}),
      [file]: "export interface Config {}\n",
    });

    mockCwd(project.root);

    await runCommand(config, "--check");

    expect(process.exitCode).toBe(1);
    expect(project.read(file)).toBe("export interface Config {}\n");
  });
});
