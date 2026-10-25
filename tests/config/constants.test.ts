import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { loadConfig } from "@auaust/engrenage/config";
import {
  builtinGeneratedFiles,
  defaultCodeFiles,
  defaultFixtureFiles,
  defaultSourceDirectories,
  defaultTestDirectories,
} from "@auaust/engrenage/config/constants";
import { pluginName } from "@auaust/engrenage/eslint/constants";
import { afterEach, describe, expect, test, vi } from "vitest";

const root = mkdtempSync(join(tmpdir(), "engrenage-constants-"));

afterEach(() => {
  rmSync(root, {
    recursive: true,
    force: true,
  });

  vi.restoreAllMocks();
});

describe("constants entries", () => {
  test("expose the defaults the global config resolves to", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const config = await loadConfig(root);

    expect(config.directories).toEqual({
      source: defaultSourceDirectories,
      test: defaultTestDirectories,
    });
    expect(config.files.code).toBe(defaultCodeFiles);
    expect(config.files.fixtures).toBe(defaultFixtureFiles);
    expect(config.files.generated).toEqual(builtinGeneratedFiles);
    expect(pluginName).toBe("auaust");
  });
});
