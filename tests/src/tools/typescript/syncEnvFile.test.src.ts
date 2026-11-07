import { describe, expect, test } from "vitest";

import { createProjectConfig } from "#project/config/operations/createProjectConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { syncEnvFile } from "#tools/typescript/setup/syncEnvFile";
import { define } from "#workflows/config/index";

async function createProject(
  input: Record<string, unknown>,
  files: Record<string, string> = {},
) {
  const project = createTemporaryProject({
    "package.json": "{}",
    ...files,
  });

  const config = createProjectConfig({
    root: project.root,
    raw: input,
    configFile: undefined,
  });

  await syncEnvFile(config);

  await config.context.filesystem.flush();

  return project;
}

const values = {
  "__DEV__": define(true, {
    description: "Whether the build includes development checks.",
  }),
  "__VERSION__": define("1.0.0", {
    type: "`${number}.${number}.${number}`",
    description: "The package version.\n\nRead from package.json.",
  }),
  "import.meta.env.MODE": "test",
};

describe("syncEnvFile", () => {
  test("appends a declaration block to an existing file and keeps the rest", async () => {
    const project = await createProject(
      {
        define: {
          values,
        },
      },
      {
        "env.d.ts": 'declare module "giget" {}\n',
      },
    );

    expect(project.read("env.d.ts")).toBe(
      [
        'declare module "giget" {}',
        "",
        "// @define",
        "/** Whether the build includes development checks. */",
        "declare const __DEV__: boolean;",
        "",
        "/**",
        " * The package version.",
        " *",
        " * Read from package.json.",
        " */",
        "declare const __VERSION__: `${number}.${number}.${number}`;",
        "// @end",
        "",
      ].join("\n"),
    );
  });

  test("leaves the file alone when types are disabled", async () => {
    const project = await createProject({
      define: {
        types: false,
        values,
      },
      typescript: {
        envFile: "src/env.d.ts",
      },
    });

    expect(() => {
      return project.read("src/env.d.ts");
    }).toThrow("ENOENT");
  });
});
