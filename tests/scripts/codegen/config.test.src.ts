import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";

import config from "#scripts/codegen/actions/config";

const file = "src/workflows/config/types/ConfigInput.ts";

beforeEach(() => {
  vi.spyOn(console, "info").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  process.exitCode = undefined;
});

describe("support codegen config", () => {
  test("passes the check on the committed interface", async () => {
    await config({ check: true });

    expect(process.exitCode).toBeUndefined();
  });

  test("fails the check on an interface that no longer matches the schema descriptions", async () => {
    const project = createTemporaryProject({
      "package.json": JSON.stringify({}),
      [file]: "export interface ConfigInput {}\n",
    });

    mockCwd(project.root);

    await config({ check: true });

    expect(process.exitCode).toBe(1);
    expect(project.read(file)).toBe("export interface ConfigInput {}\n");
  });
});
