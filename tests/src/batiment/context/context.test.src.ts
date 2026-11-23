import { describe, expect, test } from "vitest";

import { keys } from "@auaust/toolkit/object";

import { createFilesystem } from "#foundation/filesystem/index";
import { createProjectConfig } from "#project/config/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { withSourceRuntime } from "#tests/utils/withSourceRuntime";

describe("context driver", () => {
  test("discovers once for every consumer of one config context", async () => {
    const { root } = createTemporaryProject({
      "package.json": '{ "name": "project", "type": "module" }',
      "src/index.ts": "",
      "tests/a.test.ts": "",
      "packages/a/.workspace.json": "{}",
    });

    const filesystem = createFilesystem(root);

    let discoveries = 0;

    const config = createProjectConfig({
      root,
      raw: withSourceRuntime({
        workspaces: {
          "packages/*": { name: "@x/{dir}" },
        },
      }),
      configFile: undefined,
      filesystem: {
        ...filesystem,
        glob(patterns, options) {
          if (
            [patterns].flat().some((glob) => {
              return glob.includes(".workspace.json");
            })
          ) {
            discoveries += 1;
          }

          return filesystem.glob(patterns, options);
        },
      },
    });

    const [source, scopes] = await Promise.all([
      config.resolve("src"),
      config.resolve("scopes"),
      config.resolve("tests"),
      config.resolve("structure"),
    ]);

    expect(source.active).toBe(true);

    expect(keys(scopes.scopes)).toContain("packages/a");

    expect(discoveries).toBe(1);
  });
});
