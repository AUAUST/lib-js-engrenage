import { afterEach, describe, expect, test, vi } from "vitest";

import { pnpm } from "#bin/engrenage/pnpm/index";
import { installDependencies } from "#pnpm/utils/installDependencies";
import { resolveLatestPnpm } from "#pnpm/utils/resolveLatestPnpm";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { mockCwd } from "#tests/helpers/mockCwd";
import { runCommand } from "#tests/helpers/runCommand";

vi.mock("#pnpm/utils/resolveLatestPnpm");
vi.mock("#pnpm/utils/installDependencies");

function createProject(manifest: object) {
  const project = createTemporaryProject({
    "engrenage.config.ts": "export default {};\n",
    "package.json": JSON.stringify({ type: "module", ...manifest }, null, 2),
  });

  mockCwd(project.root);

  vi.mocked(resolveLatestPnpm).mockReturnValue("11.28.8");

  return project;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("engrenage pnpm upgrade", () => {
  test("replaces the legacy declaration and the only-allow script", async () => {
    const project = createProject({
      packageManager: "pnpm@10.26.0",
      scripts: { preinstall: "npx only-allow pnpm", build: "tsdown" },
    });

    vi.spyOn(console, "info").mockImplementation(() => {});

    await runCommand(pnpm, "upgrade");

    const manifest = JSON.parse(project.read("package.json"));

    expect(manifest).not.toHaveProperty("packageManager");
    expect(manifest.scripts).toEqual({ build: "tsdown" });

    expect(manifest.devEngines.packageManager).toEqual({
      name: "pnpm",
      version: "^11.28.8",
      onFail: "download",
    });

    expect(installDependencies).toHaveBeenCalledOnce();
  });

  test("keeps the declared onFail and does nothing once current", async () => {
    const project = createProject({
      devEngines: {
        packageManager: {
          name: "pnpm",
          version: "^11.0.0",
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
      version: "^11.28.8",
      onFail: "error",
    });

    vi.mocked(installDependencies).mockClear();

    await runCommand(pnpm, "upgrade");

    expect(installDependencies).not.toHaveBeenCalled();
  });

  test("refuses a project ahead of engrenage's major", async () => {
    createProject({
      devEngines: {
        packageManager: { name: "pnpm", version: "^12.0.0" },
      },
    });

    await expect(runCommand(pnpm, "upgrade")).rejects.toThrow(
      "update engrenage",
    );
  });
});
