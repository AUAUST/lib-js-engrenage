import { describe, expect, test } from "vitest";

import { configSchema } from "#config/config/schemas/configSchema";
import { createResolvedConfig } from "#config/utils/createResolvedConfig";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { getFixture } from "#tests/helpers/getFixture";
import { withSourceRuntime } from "#tests/helpers/withSourceRuntime";
import { syncApiDeclarations } from "#typescript/utils/syncApiDeclarations";
import { validate } from "#utils/validate";

function createConfig() {
  const project = createTemporaryProject({ "package.json": "{}" });

  return createResolvedConfig({
    root: project.root,
    raw: validate(configSchema, withSourceRuntime({}), "test config"),
    configFile: undefined,
  });
}

describe("syncApiDeclarations", () => {
  test("compiles every group with the real selections", async () => {
    await expect(syncApiDeclarations(createConfig())).resolves.toBeUndefined();
    // @debt The timeout is a bare literal beside `binaryTimeout`; slow compiler runs should share one named budget scale.
  }, 120_000);

  test("fails naming the group and the first month of the selection", async () => {
    await expect(
      syncApiDeclarations(createConfig(), ["temporal"], {
        libraryGroups: { temporal: "lib.temporal.d.ts" },
        libraries: getFixture("typescript/apis/libs"),
        selections: [{ from: "2022-08", lib: ["es2018.asynciterable"] }],
      }),
    ).rejects.toThrow(
      'The "temporal" API group does not compile with the ES libs selected from 2022-08 (es2018.asynciterable)',
    );
  });
});
