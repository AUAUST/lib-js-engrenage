import { describe, expect, test } from "vitest";

import { define } from "#config/config/define";
import { configSchema } from "#config/config/schemas/configSchema";
import { createResolvedConfig } from "#config/utils/createResolvedConfig";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { syncEnvFile } from "#typescript/setup/syncEnvFile";
import { validate } from "#utils/validate";

function createProject(input: unknown, files: Record<string, string> = {}) {
  const project = createTemporaryProject({
    "package.json": "{}",
    ...files,
  });

  const config = createResolvedConfig({
    root: project.root,
    raw: validate(configSchema, input, "test config"),
    configFile: undefined,
  });

  syncEnvFile(config);

  config.filesystem.flush();

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
  test("appends a declaration block to an existing file and keeps the rest", () => {
    const project = createProject(
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

  test("leaves the file alone when types are disabled", () => {
    const project = createProject({
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
