import { describe, expect, test } from "vitest";

import { readJsonFile } from "#foundation/filesystem/operations/readJsonFile";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

describe("readJsonFile", () => {
  test("fails on a missing file", async () => {
    const project = createTemporaryProject();

    await expect(readJsonFile(project.resolve("missing.json"))).rejects.toThrow(
      "missing.json",
    );
  });

  test("names the file holding invalid JSON", async () => {
    const project = createTemporaryProject({
      "broken.json": "{ broken",
    });

    const path = project.resolve("broken.json");

    await expect(readJsonFile(path)).rejects.toThrow(`Invalid JSON in ${path}`);
  });
});
