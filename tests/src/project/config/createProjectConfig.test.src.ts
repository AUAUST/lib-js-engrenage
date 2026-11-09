import { describe, expect, test } from "vitest";

import { values } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { createProjectConfig } from "#project/config/operations/createProjectConfig";
import { packageJsonSection } from "#project/package/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

import * as builtins from "#workflows/builtins/entry";

const fixture = { name: "external-fixture" };

function createConfig(raw: Readonly<Record<string, unknown>>) {
  return createProjectConfig({
    root: createTemporaryProject().root,
    raw,
    configFile: undefined,
  });
}

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

  test("registers the built-ins without listed extensions", () => {
    expect(createConfig({}).context.registry.extensions).toEqual(
      values(builtins).flat(),
    );
  });

  test("rejects an extension listed twice", () => {
    expect(() => createConfig({ extensions: [fixture, fixture] })).toThrow(
      'Extension "external-fixture" is registered twice',
    );
  });

  test("rejects a listed value that is not an extension, naming its index", () => {
    expect(() => createConfig({ extensions: [1] })).toThrow(
      /Invalid extensions config[\s\S]*at 0/u,
    );
  });
});
