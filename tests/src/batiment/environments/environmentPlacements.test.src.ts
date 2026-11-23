import { describe, expect, test } from "vitest";

import {
  createEnvironmentPreset,
  discoverEnvironmentPlacements,
  getFileEnvironment,
  resolveRegisteredEnvironments,
  type EnvironmentRegistration,
} from "#batiment/environments/index";
import { createFilesystem } from "#foundation/filesystem/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

const presets = [
  createEnvironmentPreset({ name: "web", languages: ["typescript", "css"] }),
  createEnvironmentPreset({ name: "node", languages: ["typescript"] }),
];

function register(
  name: string,
  preset: string,
  placements: Partial<Pick<EnvironmentRegistration, "dirs" | "files">>,
): EnvironmentRegistration {
  return {
    name,
    preset,
    dirs: [],
    files: [],
    ...placements,
  };
}

async function place(
  files: Record<string, string>,
  registrations: readonly EnvironmentRegistration[],
) {
  const { root } = createTemporaryProject(files);

  const registered = resolveRegisteredEnvironments(presets, registrations);

  const discovered = await discoverEnvironmentPlacements({
    registered,
    ignored: [],
    filesystem: createFilesystem(root),
  });

  return { registered, ...discovered };
}

describe("environment placements", () => {
  test("gives a root config file its file placement over the directory placed around it", async () => {
    const { placements, diagnostics } = await place(
      { "app/uno.config.ts": "", "app/main.css": "" },
      [
        register("frontend", "web", { dirs: ["app"] }),
        register("tooling", "node", { files: ["app/*.config.ts"] }),
      ],
    );

    expect(diagnostics).toEqual([]);

    expect(getFileEnvironment(placements, "app/uno.config.ts")).toBe("tooling");

    expect(getFileEnvironment(placements, "app/main.css")).toBe("frontend");
  });

  test("gives a nested directory placement's subtree none of the enclosing environment's fields", async () => {
    const { placements, registered } = await place({}, [
      {
        ...register("frontend", "web", { dirs: ["app"] }),
        languages: ["typescript", "css", "html"],
      },
      register("server", "node", { dirs: ["app/server"] }),
    ]);

    const environment = getFileEnvironment(
      placements,
      "app/server/routes/index.ts",
    );

    expect(environment).toBe("server");

    expect(
      registered.find(({ registration }) => {
        return registration.name === environment;
      })?.languages,
    ).toEqual(["typescript"]);
  });

  test("reports two file placements on one file, keeping the first", async () => {
    const { placements, diagnostics } = await place({ "vite.config.ts": "" }, [
      register("tooling", "node", { files: ["*.config.ts"] }),
      register("bundle", "web", { files: ["vite.*.ts"] }),
    ]);

    expect(getFileEnvironment(placements, "vite.config.ts")).toBe("tooling");

    expect(diagnostics).toEqual([
      expect.objectContaining({
        severity: "error",
        code: "environment-placement-conflict",
        files: ["vite.config.ts"],
        message: expect.stringMatching(/tooling.*bundle/),
      }),
    ]);
  });
});
