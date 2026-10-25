import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { readJsonFile } from "#support/filesystem/utils/readJsonFile";

let root: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "engrenage-json-"));
});

afterEach(() => {
  rmSync(root, {
    recursive: true,
    force: true,
  });
});

describe("readJsonFile", () => {
  test("fails on a missing file", () => {
    expect(() => {
      return readJsonFile(join(root, "missing.json"));
    }).toThrow("missing.json");
  });

  test("names the file holding invalid JSON", () => {
    const path = join(root, "broken.json");

    writeFileSync(path, "{ broken");

    expect(() => {
      return readJsonFile(path);
    }).toThrow(`Invalid JSON in ${path}`);
  });
});
