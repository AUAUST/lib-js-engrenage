import { describe, expect, test } from "vitest";

import { declareSection } from "#foundation/options/index";
import { createProjectConfig } from "#project/config/operations/createProjectConfig";
import { packageJsonSection } from "#project/package/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

describe("createProjectConfig", () => {
  test("re-resolves a memoized section reading packageJson after its file is staged", async () => {
    const project = createTemporaryProject({
      "package.json": '{ "name": "before", "type": "module" }',
    });

    const nameSection = declareSection({
      name: "name",
      async resolve(_input, config) {
        return (await config.resolve(packageJsonSection)).optional.name;
      },
    });

    const config = createProjectConfig({
      root: project.root,
      raw: {},
      configFile: undefined,
    });

    expect(await config.resolve(nameSection)).toBe("before");

    await config.context.filesystem.write(
      config.context.path("package.json"),
      '{ "name": "after", "type": "module" }',
    );

    expect(await config.resolve(nameSection)).toBe("after");
  });
});
