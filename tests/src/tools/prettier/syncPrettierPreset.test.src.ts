import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { syncPrettierPreset } from "#tools/prettier/setup/syncPrettierPreset";

async function syncPrettierKey(prettier: string): Promise<unknown> {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({ type: "module", prettier }),
  });

  const config = await loadConfig(project.root);

  await syncPrettierPreset(config);

  await config.context.filesystem.flush();

  return JSON.parse(project.read("package.json")).prettier;
}

describe("syncPrettierPreset", () => {
  test("points the API subpath to the ready-made config", async () => {
    await expect(syncPrettierKey("@auaust/engrenage/prettier")).resolves.toBe(
      "@auaust/engrenage/prettier/config",
    );
  });

  test("leaves a custom config", async () => {
    await expect(syncPrettierKey("./prettier.config.ts")).resolves.toBe(
      "./prettier.config.ts",
    );
  });
});
