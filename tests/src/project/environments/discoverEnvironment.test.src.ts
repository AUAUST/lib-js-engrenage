import { execFileSync } from "node:child_process";

import { describe, expect, test } from "vitest";

import {
  createProjectConfig,
  type ConfigResolver,
} from "#project/config/index";
import {
  discoverDeclaredEnvironment,
  discoverEnvironment,
  listEnvironmentEntries,
} from "#project/environments/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { withSourceRuntime } from "#tests/utils/withSourceRuntime";

function loadProject() {
  const project = createTemporaryProject({
    ".gitignore": "scripts/\ntheme/scripts/\n",
    "package.json": JSON.stringify({ name: "root", type: "module" }),
    "src/index.ts": "export {};\n",
    "scripts/build/index.ts": "export {};\n",
    "theme/package.json": JSON.stringify({ name: "theme", type: "module" }),
    "theme/.workspace.json": "{}",
    "theme/src/index.ts": "export {};\n",
    "theme/scripts/build/index.ts": "export {};\n",
    "theme/tooling/index.ts": "export {};\n",
  });

  execFileSync("git", ["init", "--quiet"], {
    cwd: project.root,
    stdio: "ignore",
  });

  return createProjectConfig({
    root: project.root,
    raw: withSourceRuntime({
      tooling: {
        dirs: ["tooling", "."],
      },
      workspaces: {
        globs: {
          theme: { name: "theme" },
        },
      },
    }),
    configFile: undefined,
  });
}

async function compareDiscoveries(config: ConfigResolver) {
  const entries = await listEnvironmentEntries(config);

  return Promise.all(
    entries.map(async ({ entry: { name } }) => {
      const [alone, { dirs, rootFiles, active }] = await Promise.all([
        discoverEnvironment(config, name),
        discoverDeclaredEnvironment(config, name),
      ]);

      return [
        name,
        alone,
        {
          dirs,
          rootFiles,
          active,
        },
      ] as const;
    }),
  );
}

describe("discoverEnvironment", () => {
  test("give each environment of every scope what the project's discovery gives it", async () => {
    const config = loadProject();

    const theme = await config.context.scope("theme");

    for (const scope of [config, theme]) {
      for (const [name, alone, discovered] of await compareDiscoveries(scope)) {
        expect(alone, name).toEqual(discovered);
      }
    }

    expect(await discoverEnvironment(theme, "scripts")).toEqual({
      dirs: ["theme/scripts"],
      rootFiles: [],
      active: false,
    });
  });

  test("reject an environment no active extension contributes", async () => {
    const config = loadProject();

    await expect(discoverEnvironment(config, "liquid")).rejects.toThrow(
      "Discovery placed no liquid environment",
    );
  });
});
