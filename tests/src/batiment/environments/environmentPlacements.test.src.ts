import { describe, expect, test } from "vitest";

import { entries, keys, record } from "@auaust/toolkit/object";

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
  workspaces: Readonly<Record<string, readonly EnvironmentRegistration[]>> = {},
) {
  const { root } = createTemporaryProject(files);

  const registered = [
    ...resolveRegisteredEnvironments(presets, registrations, "."),
    ...entries(workspaces).flatMap(([scope, scoped]) => {
      return resolveRegisteredEnvironments(presets, scoped, scope);
    }),
  ];

  const discovered = await discoverEnvironmentPlacements({
    registered,
    scopes: keys(workspaces),
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

  test("keeps a scope's globs from matching a nested workspace's files", async () => {
    const { placements } = await place(
      { "vite.config.ts": "", "theme/vite.config.ts": "" },
      [register("tooling", "node", { files: ["**/*.config.ts"] })],
      { theme: [register("bundle", "web", { files: ["*.config.ts"] })] },
    );

    expect(getFileEnvironment(placements, "vite.config.ts")).toBe("tooling");

    expect(getFileEnvironment(placements, "theme/vite.config.ts")).toBe(
      "bundle",
    );
  });

  test("forms one instance per scope registering an environment, listing the placements nested in it", async () => {
    const { placements, registered } = await place(
      {
        "extensions/home/src/index.ts": "",
        "extensions/cart/src/index.ts": "",
        "app/server/index.ts": "",
      },
      [
        register("frontend", "web", { dirs: ["app", "*/*/src"] }),
        register("server", "node", { dirs: ["app/server"] }),
      ],
      {
        "extensions/cart": [register("frontend", "web", { dirs: ["src"] })],
        "extensions/home": [register("frontend", "web", { dirs: ["src"] })],
      },
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
    instances: environments.instances,
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

describe("environment instance activity", () => {
  test("counts no file another environment's nested placement takes", async () => {
    const { instances } = await discoverConfigured({
      input: withSourceRuntime({
        environments: {
          web: { preset: "src", dirs: ["app"] },
          server: { preset: "bin", dirs: ["app/server"] },
          tooling: { preset: "bin", files: ["app/*.config.ts"] },
        },
      }),
      files: {
        "app/server/index.ts": "",
        "app/vite.config.ts": "",
      },
    });

    const activity = record(
      instances.map(({ environment, active }) => [environment, active]),
    );

    expect(activity).toMatchObject({
      web: false,
      server: true,
      tooling: true,
    });
  });

  test("counts a file of its own beside a nested placement", async () => {
    const { instances } = await discoverConfigured({
      input: withSourceRuntime({
        environments: {
          web: { preset: "src", dirs: ["app"] },
          server: { preset: "bin", dirs: ["app/server"] },
        },
      }),
      files: {
        "app/server/index.ts": "",
        "app/main.ts": "",
      },
    });

    expect(
      instances.find(({ environment }) => environment === "web")?.active,
    ).toBe(true);
  });
});

describe("environment placements across workspaces", () => {
  test("reject a placement inside a nested workspace, naming its metafile", async () => {
    await expect(
      discoverConfigured({
        input: withSourceRuntime({
          environments: {
            web: { preset: "src", dirs: ["theme/src"] },
          },
        }),
        files: {
          "theme/.workspace.json": "{}",
          "theme/src/index.ts": "",
        },
      }),
    ).rejects.toThrow(
      "The environment web of the root is placed on theme/src by environments.web.dirs, inside the workspace theme: register it in theme/.workspace.json",
    );
  });

  test("skip a directory glob's matches inside a nested workspace", async () => {
    const { placements } = await discoverConfigured({
      input: withSourceRuntime({
        environments: {
          web: { preset: "src", dirs: ["app/*", "theme/*"] },
        },
      }),
      files: {
        "app/ui/index.ts": "",
        "theme/.workspace.json": "{}",
        "theme/ui/index.ts": "",
      },
    });

    expect(placements.dirs).toMatchObject({ "app/ui": "web" });

    expect(placements.dirs).not.toHaveProperty(["theme/ui"]);
  });

  test("give a workspace's file the workspace's instance of a root file glob", async () => {
    const { instances } = await discoverConfigured({
      input: withSourceRuntime({
        environments: {
          tooling: { preset: "bin", files: ["**/*.config.ts"] },
        },
      }),
      files: {
        "vite.config.ts": "",
        "theme/.workspace.json": "{}",
        "theme/vite.config.ts": "",
      },
    });

    expect(
      instances
        .filter(({ environment }) => environment === "tooling")
        .map(({ scope, files }) => {
          return { scope, files };
        }),
    ).toEqual([
      { scope: ".", files: ["vite.config.ts"] },
      { scope: "theme", files: ["theme/vite.config.ts"] },
    ]);
  });
});

describe("environment metafiles", () => {
  test("report an unregistered name, the directory keeping the environment placed above it", async () => {
    const { placements, diagnostics } = await discoverConfigured({
      input: withSourceRuntime({
        environments: {
          web: { preset: "src", dirs: ["app"] },
        },
      }),
      files: {
        "app/lib/.environment.json": '{ "environment": "vue" }',
        "app/lib/a.ts": "",
      },
    });

    expect(diagnostics).toEqual([
      { code: "unknown-environment", path: "app/lib" },
    ]);

    expect(getDirectoryEnvironment(placements, "app/lib")).toBe("web");
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
