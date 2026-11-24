import { describe, expect, test } from "vitest";

import {
  createEnvironmentPreset,
  discoverEnvironmentPlacements,
  getDirectoryEnvironment,
  getFileEnvironment,
  listEnvironmentInstances,
  resolveRegisteredEnvironments,
  type EnvironmentRegistration,
} from "#batiment/environments/index";
import { createFilesystem } from "#foundation/filesystem/index";
import { createPresetConfig } from "#tests/utils/createPresetConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { withSourceRuntime } from "#tests/utils/withSourceRuntime";

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
    metafiles: [],
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
    ).toEqual([{ name: "typescript" }]);
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

  test("forms one instance per scope a globbed placement reaches, listing the placements nested in it", async () => {
    const { placements, registered } = await place(
      {
        "extensions/home/src/index.ts": "",
        "extensions/cart/src/index.ts": "",
        "app/server/index.ts": "",
      },
      [
        register("frontend", "web", { dirs: ["app", "extensions/*/src"] }),
        register("server", "node", { dirs: ["app/server"] }),
      ],
    );

    const instances = listEnvironmentInstances(
      registered,
      placements,
      ["extensions/cart", "extensions/home"],
      new Set(["app"]),
    );

    expect(instances).toEqual([
      {
        environment: "frontend",
        scope: ".",
        dirs: ["app"],
        files: [],
        nested: [{ environment: "server", dir: "app/server" }],
        active: true,
      },
      {
        environment: "frontend",
        scope: "extensions/cart",
        dirs: ["extensions/cart/src"],
        files: [],
        nested: [],
        active: false,
      },
      {
        environment: "frontend",
        scope: "extensions/home",
        dirs: ["extensions/home/src"],
        files: [],
        nested: [],
        active: false,
      },
      {
        environment: "server",
        scope: ".",
        dirs: ["app/server"],
        files: [],
        nested: [],
        active: false,
      },
    ]);
  });
});

async function discoverConfigured({
  input,
  preset = {},
  files,
}: {
  input: Readonly<Record<string, unknown>>;
  preset?: Readonly<Record<string, unknown>>;
  files: Record<string, string>;
}) {
  const config = createPresetConfig({
    root: createTemporaryProject({
      "package.json": JSON.stringify({ name: "app", type: "module" }),
      ...files,
    }).root,
    preset,
    input,
  });

  const context = await config.resolve("structure.context");

  const { environments, diagnostics } = await context.discover();

  return {
    placements: environments.placements,
    diagnostics: diagnostics.map(({ code, path }) => {
      return { code, path };
    }),
  };
}

const appPlacement = {
  environments: {
    web: { preset: "src", dirs: ["app"] },
    node: { preset: "bin" },
  },
};

describe("environment metafiles", () => {
  test("report an unregistered name, the directory keeping the environment placed above it", async () => {
    const { placements, diagnostics } = await discoverConfigured({
      input: withSourceRuntime({
        environments: {
          web: { preset: "src", dirs: ["theme"] },
        },
      }),
      files: {
        "theme/.workspace.json": "{}",
        "theme/src/.environment.json": '{ "environment": "vue" }',
        "theme/src/a.ts": "",
      },
    });

    expect(diagnostics).toEqual([
      { code: "unknown-environment", path: "theme/src" },
    ]);

    expect(getDirectoryEnvironment(placements, "theme/src")).toBe("web");
  });

  test.each([
    {
      layer: "the config input",
      input: withSourceRuntime(appPlacement),
      preset: {},
      reported: [{ code: "config-metafile-conflict", path: "app" }],
    },
    {
      layer: "a default layer",
      input: {},
      preset: withSourceRuntime(appPlacement),
      reported: [],
    },
  ])("replace a placement $layer sets", async ({ input, preset, reported }) => {
    const { placements, diagnostics } = await discoverConfigured({
      input,
      preset,
      files: {
        "app/.environment.json": '{ "environment": "node" }',
        "app/a.ts": "",
      },
    });

    expect(diagnostics).toEqual(reported);

    expect(getDirectoryEnvironment(placements, "app")).toBe("node");
  });

  test("ignore a metafile holding anything but the environment, or at a scope's root", async () => {
    const { diagnostics } = await discoverConfigured({
      input: withSourceRuntime(),
      files: {
        "src/.environment.json": '{ "environment": "src", "languages": [] }',
        "theme/.workspace.json": "{}",
        "theme/.environment.json": '{ "environment": "src" }',
      },
    });

    expect(diagnostics).toEqual([
      { code: "invalid-metafile", path: "src" },
      { code: "misplaced-environment-metafile", path: "theme" },
    ]);
  });
});
