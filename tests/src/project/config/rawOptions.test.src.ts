import { describe, expect, test } from "vitest";

import { createFilesystem } from "#foundation/filesystem/index";
import { createProjectConfig, type ConfigContext } from "#project/config/index";
import {
  getOptionsKey,
  listEnvironmentEntries,
} from "#project/environments/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import type { Resolver } from "#foundation/options/index";

function createConfig(raw: Readonly<Record<string, unknown>>) {
  const { root } = createTemporaryProject({
    "package.json": '{ "name": "project", "type": "module" }',
  });

  const filesystem = createFilesystem(root);

  return createProjectConfig({
    root,
    raw,
    configFile: undefined,
    filesystem: {
      ...filesystem,
      glob() {
        throw new Error("Raw options must not walk the project");
      },
    },
  });
}

describe("raw options", () => {
  test("data, static and workspaces options resolve without discovery", async () => {
    const config = createConfig({
      data: {
        dirs: ["assets"],
      },
      static: {
        dirs: ["public"],
      },
      workspaces: {
        globs: {
          "packages/*": { name: "@scope/{dir}" },
        },
      },
    });

    expect(await config.resolve("data.options")).toMatchObject({
      enabled: true,
      dirs: ["assets"],
    });

    expect(await config.resolve("static.options")).toMatchObject({
      enabled: true,
      dirs: ["public"],
    });

    expect(await config.resolve("workspaces.options")).toMatchObject({
      globs: {
        "packages/*": { name: "@scope/{dir}" },
      },
      extra: "accept",
    });
  });

  test("every environment's options key resolves its options", async () => {
    const config = createConfig({});

    const resolver: Resolver<ConfigContext> = config;

    const entries = await listEnvironmentEntries(config);

    const keys = entries.map(getOptionsKey);

    expect(keys).toEqual(
      expect.arrayContaining(["data.options", "static.options"]),
    );

    for (const key of keys) {
      expect(await resolver.resolve(key)).toHaveProperty("dirs");
    }
  });

  test("a disabled environment's options keep their disabled value", async () => {
    const config = createConfig({ data: false });

    expect(await config.resolve("data.options")).toMatchObject({
      enabled: false,
      dirs: [],
    });
  });
});
