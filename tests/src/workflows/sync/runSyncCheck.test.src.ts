import { afterEach, describe, expect, test, vi } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { runSync } from "#project/sync/index";
import { settleChanges } from "#project/sync/operations/settleChanges";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";
import { readTestPnpmVersions } from "#tests/utils/readTestPnpmVersions";
import { runSyncCheck } from "#workflows/sync/operations/runSyncCheck";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("runSyncCheck", () => {
  test("passes with a pnpm warning without writing to the console", async () => {
    const stderr = vi
      .spyOn(process.stderr, "write")
      .mockImplementation(() => true);

    const stdout = vi
      .spyOn(process.stdout, "write")
      .mockImplementation(() => true);

    const project = createTemporaryProject({
      "package.json": JSON.stringify({
        type: "module",
        devEngines: {
          packageManager: {
            name: "pnpm",
            version: `^${readTestPnpmVersions().previousMajor}`,
            onFail: "download",
          },
        },
      }),
      "engrenage.config.ts": "export default {};",
    });

    const config = await loadConfig(project.root, {
      reporter: createTestReporter(),
    });

    await settleChanges(config, {
      check: false,
      failures: await runSync(config),
    });

    const { ok, output, warnings } = await runSyncCheck(config);

    expect(ok).toBe(true);
    expect(output).toBe("");
    expect(warnings).toContain("package.json: ");
    expect(warnings).toContain("engrenage pnpm upgrade");
    expect(stderr).not.toHaveBeenCalled();
    expect(stdout).not.toHaveBeenCalled();
  });
});
