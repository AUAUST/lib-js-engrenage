import { describe, expect, test } from "vitest";

import { readJsonFile } from "#support/filesystem/utils/readJsonFile";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";

describe("readJsonFile", () => {
  test("fails on a missing file", () => {
    const project = createTemporaryProject();

    expect(() => {
      return readJsonFile(project.resolve("missing.json"));
    }).toThrow("missing.json");
  });

  test("names the file holding invalid JSON", () => {
    const project = createTemporaryProject({
      "broken.json": "{ broken",
    });

    const path = project.resolve("broken.json");

    expect(() => {
      return readJsonFile(path);
    }).toThrow(`Invalid JSON in ${path}`);
  });
});
