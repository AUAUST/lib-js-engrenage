import { join } from "node:path";

import { describe, expect, test } from "vitest";

import { loadConfig, validateConfig } from "@auaust/engrenage";
import * as config from "@auaust/engrenage/config";

import { getFixture } from "#tests/utils/getFixture";

describe("public configuration surface", () => {
  test("validateConfig of the root entry fails on an unknown key", async () => {
    const root = getFixture("config/invalid");
    const loaded = await loadConfig(root);

    expect(() => validateConfig(loaded)).toThrow(
      join(root, "engrenage.config.ts"),
    );
  });

  test("the config entry exports no loadConfig", () => {
    expect(config).not.toHaveProperty("loadConfig");
    expect(config).toHaveProperty("defineConfig");
  });
});
