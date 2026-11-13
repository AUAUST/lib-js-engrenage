import { describe, expect, test } from "vitest";

import { createProjectConfig, type Extension } from "#project/config/index";
import { stable, type TagDeclaration } from "#project/docs/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { withSourceRuntime } from "#tests/utils/withSourceRuntime";

const relates: TagDeclaration = { name: "relates", body: "inline" };

function createExtension(name: string): Extension {
  return {
    name,
    contributes: {
      "docs.tags": [
        {
          name,
          load() {
            return Promise.resolve([relates]);
          },
        },
      ],
    },
  };
}

async function resolveTags(
  input: Readonly<Record<string, unknown>>,
  extensions: readonly Extension[] = [createExtension("relations")],
) {
  const project = createTemporaryProject({
    "package.json": '{ "name": "project", "type": "module" }',
  });

  const config = createProjectConfig({
    root: project.root,
    raw: withSourceRuntime({ extensions, ...input }),
    configFile: undefined,
  });

  const { tags } = await config.resolve("docs");

  return tags.map(({ name }) => name);
}

describe("docs section", () => {
  test("ends the contributed list with an extension's tags", async () => {
    const names = await resolveTags({});

    expect(names.at(-1)).toBe("relates");
    expect(names.indexOf("description")).toBe(0);
  });

  test("replaces an appended tag in place", async () => {
    const project = createTemporaryProject({
      "package.json": '{ "name": "project", "type": "module" }',
    });

    const config = createProjectConfig({
      root: project.root,
      raw: withSourceRuntime({
        docs: {
          tags: { append: [stable({ output: "internal" })] },
        },
      }),
      configFile: undefined,
    });

    const { tags } = await config.resolve("docs");

    const names = tags.map(({ name }) => name);

    expect(names.indexOf("stable")).toBe(names.length - 2);
    expect(tags.find(({ name }) => name === "stable")?.output).toBe("internal");
  });

  test("drops an excluded tag", async () => {
    expect(
      await resolveTags({
        docs: {
          tags: { exclude: ["remarks"] },
        },
      }),
    ).not.toContain("remarks");
  });

  test("fails when two extensions declare one tag", async () => {
    await expect(
      resolveTags({}, [createExtension("first"), createExtension("second")]),
    ).rejects.toThrow(/first.*second/);
  });
});
