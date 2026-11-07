import { join } from "node:path";

import { describe, expect, test } from "vitest";

import * as root from "@auaust/engrenage";
import { loadValidatedConfig } from "@auaust/engrenage/config";
import * as config from "@auaust/engrenage/config";

import { getFixture } from "#tests/utils/getFixture";

describe("public configuration surface", () => {
  test("loadValidatedConfig of the config entry fails on an unknown key", async () => {
    const fixture = getFixture("config/invalid");

    await expect(loadValidatedConfig(fixture)).rejects.toThrow(
      join(fixture, "engrenage.config.ts"),
    );
  });

  test("the config entry, not the root entry, exports the config loaders", () => {
    expect(config).toHaveProperty("loadConfig");
    expect(config).toHaveProperty("loadValidatedConfig");
    expect(root).not.toHaveProperty("loadConfig");
    expect(root).not.toHaveProperty("loadValidatedConfig");
  });
});
