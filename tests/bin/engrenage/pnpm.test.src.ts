import { afterEach, describe, expect, test, vi } from "vitest";

import { pnpm } from "#bin/engrenage/pnpm/index";
import { readSharedPnpmRange } from "#project/package/utils/readSharedPnpmRange";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { readTestPnpmVersions } from "#tests/utils/readTestPnpmVersions";
import { runCommand } from "#tests/utils/runCommand";
import { installDependencies } from "#tools/pnpm/operations/installDependencies";
import { resolveLatestPnpm } from "#tools/pnpm/operations/resolveLatestPnpm";

vi.mock("#tools/pnpm/operations/resolveLatestPnpm");
vi.mock("#tools/pnpm/operations/installDependencies");

const versions = readTestPnpmVersions();

function createProject(manifest: object) {
  const project = createTemporaryProject({
    "engrenage.config.ts": "export default {};\n",
    "package.json": JSON.stringify({ type: "module", ...manifest }, null, 2),
  });

  mockCwd(project.root);

  vi.mocked(resolveLatestPnpm).mockResolvedValue(versions.latest);

  return project;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("engrenage pnpm upgrade", () => {
  test("replaces the legacy declaration and the only-allow script", async () => {
    const project = createProject({
      packageManager: `pnpm@${versions.previousMajor}`,
      scripts: { preinstall: "npx only-allow pnpm", build: "tsdown" },
    });

    vi.spyOn(console, "info").mockImplementation(() => {});

    await runCommand(pnpm, "upgrade");

    const manifest = JSON.parse(project.read("package.json"));

    expect(manifest).not.toHaveProperty("packageManager");
    expect(manifest.scripts).toEqual({ build: "tsdown" });

    expect(manifest.devEngines.packageManager).toEqual({
      name: "pnpm",
      version: `^${versions.latest}`,
      onFail: "download",
    });

    expect(installDependencies).toHaveBeenCalledOnce();
  });

  test("keeps the declared onFail and does nothing once current", async () => {
    const project = createProject({
      devEngines: {
        packageManager: {
          name: "pnpm",
          version: `^${versions.belowFloor}`,
          onFail: "error",
        },
      },
    });

    vi.spyOn(console, "info").mockImplementation(() => {});

    await runCommand(pnpm, "upgrade");

    expect(
      JSON.parse(project.read("package.json")).devEngines.packageManager,
    ).toEqual({
      name: "pnpm",
      version: `^${versions.latest}`,
      onFail: "error",
    });

    vi.mocked(installDependencies).mockClear();

    await runCommand(pnpm, "upgrade");

    expect(installDependencies).not.toHaveBeenCalled();
  });

  test("warns for a project ahead of the range and moves it back with --yes", async () => {
    const project = createProject({
      devEngines: {
        packageManager: { name: "pnpm", version: `^${versions.nextMajor}` },
      },
    });

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    vi.spyOn(console, "info").mockImplementation(() => {});

    await runCommand(pnpm, "upgrade", "--yes");

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("update engrenage"),
    );

    expect(resolveLatestPnpm).toHaveBeenCalledWith(
      project.root,
      readSharedPnpmRange().range,
    );

    expect(
      JSON.parse(project.read("package.json")).devEngines.packageManager
        .version,
    ).toBe(`^${versions.latest}`);
  });
});
