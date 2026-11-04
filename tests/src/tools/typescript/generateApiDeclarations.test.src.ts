import { describe, expect, test } from "vitest";

import { validate } from "#foundation/options/utils/validate";
import { configSchema } from "#project/config/config/schemas/configSchema";
import { createResolvedConfig } from "#project/config/operations/createResolvedConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getFixture } from "#tests/utils/getFixture";
import { withSourceRuntime } from "#tests/utils/withSourceRuntime";
import { generateApiDeclarations } from "#tools/typescript/operations/generateApiDeclarations";

function createConfig() {
  const project = createTemporaryProject({ "package.json": "{}" });

  return createResolvedConfig({
    root: project.root,
    raw: validate(configSchema, withSourceRuntime({}), "test config"),
    configFile: undefined,
  });
}

describe("generateApiDeclarations", () => {
  test("compiles every group with the real selections", async () => {
    await expect(
      generateApiDeclarations(createConfig()),
    ).resolves.toBeUndefined();
    // @debt The timeout is a bare literal beside `binaryTimeout`; slow compiler runs should share one named budget scale.
  }, 120_000);

  test("fails naming the group and the first month of the selection", async () => {
    await expect(
      generateApiDeclarations(createConfig(), ["temporal"], {
        libraryGroups: { temporal: "lib.temporal.d.ts" },
        libraries: getFixture("typescript/apis/libs"),
        selections: [{ from: "2022-08", lib: ["es2018.asynciterable"] }],
      }),
    ).rejects.toThrow(
      'The "temporal" API group does not compile with the ES libs selected from 2022-08 (es2018.asynciterable)',
    );
  });

  test("fails when a group conflicts with a selected ES lib", async () => {
    await expect(
      generateApiDeclarations(createConfig(), ["conflict"], {
        libraryGroups: { conflict: "lib.conflict.d.ts" },
        libraries: getFixture("typescript/apis/libs"),
        selections: [{ from: "2022-08", lib: ["es2022"] }],
      }),
    ).rejects.toThrow(
      "Subsequent property declarations must have the same type",
    );
  });
});
