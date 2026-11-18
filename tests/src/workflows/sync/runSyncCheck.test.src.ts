import { afterEach, describe, expect, test, vi } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";
import { readTestPnpmVersions } from "#tests/utils/readTestPnpmVersions";
import { runSyncCheck } from "#workflows/sync/operations/runSyncCheck";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("runSyncCheck", () => {
  test("returns a pnpm warning in its output without writing to the console", async () => {
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

    const { output } = await runSyncCheck(
      await loadConfig(project.root, {
        reporter: createTestReporter(),
      }),
    );

    expect(output).toContain("package.json: ");
    expect(output).toContain("engrenage pnpm upgrade");
    expect(stderr).not.toHaveBeenCalled();
    expect(stdout).not.toHaveBeenCalled();
  });
});
