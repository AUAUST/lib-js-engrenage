import { join } from "node:path";

import { describe, expect, test } from "vitest";

import * as root from "@auaust/engrenage";
import * as config from "@auaust/engrenage/config";
import * as extensions from "@auaust/engrenage/extensions";
import { loadValidatedConfig } from "@auaust/engrenage/extensions";

import { getFixture } from "#tests/utils/getFixture";

describe("public configuration surface", () => {
  test("loadValidatedConfig of the extensions entry fails on an unknown key", async () => {
    const fixture = getFixture("config/invalid");

    await expect(loadValidatedConfig(fixture)).rejects.toThrow(
      join(fixture, "engrenage.config.ts"),
    );
  });

  test("the extensions entry, not the config or root entry, exports the config loaders", () => {
    expect(extensions).toHaveProperty("loadConfig");
    expect(extensions).toHaveProperty("loadValidatedConfig");
    expect(config).not.toHaveProperty("loadConfig");
    expect(config).not.toHaveProperty("loadValidatedConfig");
    expect(root).not.toHaveProperty("loadConfig");
    expect(root).not.toHaveProperty("loadValidatedConfig");
  });
});
