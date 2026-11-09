import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { listSyncOptions } from "#workflows/sync/index";

async function listTargets(
  devDependencies: Readonly<Record<string, string>>,
): Promise<readonly string[]> {
  const project = createTemporaryProject({
    "engrenage.config.ts": "export default {};\n",
    "package.json": JSON.stringify({ type: "module", devDependencies }),
  });

  const { targets } = await listSyncOptions(await loadConfig(project.root));

  return targets;
}

describe("listSyncOptions", () => {
  test("lists the changesets target only when its CLI is installed", async () => {
    expect(await listTargets({})).not.toContain("changesets");

    expect(await listTargets({ "@changesets/cli": "*" })).toContain(
      "changesets",
    );
  });
});
