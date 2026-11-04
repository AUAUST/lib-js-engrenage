import { join } from "node:path";

import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage";
import * as config from "@auaust/engrenage/config";

import { getFixture } from "#tests/utils/getFixture";

describe("public configuration surface", () => {
  test("loadConfig of the root entry fails on an unknown key", async () => {
    const root = getFixture("config/invalid");

    await expect(loadConfig(root)).rejects.toThrow(
      join(root, "engrenage.config.ts"),
    );
  });

  test("the config entry exports no loadConfig", () => {
    expect(config).not.toHaveProperty("loadConfig");
    expect(config).toHaveProperty("defineConfig");
  });
});
