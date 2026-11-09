import { describe, expect, test } from "vitest";

import { createProjectConfig } from "#project/config/operations/createProjectConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

function createConfig(extensions: readonly unknown[]) {
  return createProjectConfig({
    root: createTemporaryProject({
      "package.json": JSON.stringify({ name: "resources" }),
    }).root,
    raw: { extensions },
    configFile: undefined,
  });
}

function sharedFile(name: string) {
  return {
    name,
    owns: {
      files: {
        [`${name}.shared`]: {
          locate: async () => {
            return { file: "shared.txt" };
          },
        },
      },
    },
  };
}

describe("file resources", () => {
  test("fails when two resources are located at one file", async () => {
    const config = createConfig([sharedFile("first"), sharedFile("second")]);

    await expect(config.resolve("resources")).rejects.toThrow(
      'File resources "first.shared" of first and "second.shared" of second are both located at shared.txt',
    );
  });

  test("leaves out the resources of an inactive owner", async () => {
    const config = createConfig([
      {
        name: "gated-fixture",
        when: {
          installed: "absent-package",
        },
        owns: {
          files: {
            gated: {
              locate: async () => {
                return { file: "gated.txt" };
              },
            },
          },
        },
      },
    ]);

    const resources = await config.resolve("resources");

    expect(resources.list().map(({ name }) => name)).not.toContain("gated");
    expect(resources.get("gated")).toBeUndefined();

    expect(() => resources.get("nope")).toThrow('Unknown file resource "nope"');
  });

  test("fails the reads of a resource that cannot be located only", async () => {
    const rejection = new Error("unreadable");

    const config = createConfig([
      {
        name: "broken-fixture",
        owns: {
          files: {
            broken: {
              committed: false,
              locate: async () => {
                throw rejection;
              },
            },
            fine: {
              locate: async () => {
                return { file: "fine.txt" };
              },
            },
          },
        },
      },
    ]);

    const resources = await config.resolve("resources");

    expect(resources.get("fine")?.location).toEqual({ file: "fine.txt" });
    expect(resources.path("fine")).toBe(config.context.path("fine.txt"));

    const failure = expect.objectContaining({
      message:
        'File resource "broken" of broken-fixture cannot be located: unreadable',
      cause: rejection,
    });

    expect(() => resources.get("broken")).toThrow(failure);
    expect(() => resources.path("broken")).toThrow(failure);
    expect(() => resources.list()).toThrow(failure);
    expect(() => resources.list({ committed: false })).toThrow(failure);
    expect(resources.list({ generated: true })).toEqual([]);
  });

  test("locates the resources of an owner its staged manifest activates", async () => {
    const config = createConfig([]);

    const before = await config.resolve("resources");

    expect(before.get("CHANGELOG.md")).toBeUndefined();

    await config.context.filesystem.write(
      config.context.path("package.json"),
      JSON.stringify({
        name: "resources",
        devDependencies: { "@changesets/cli": "1.0.0" },
      }),
    );

    const after = await config.resolve("resources");

    expect(after.get("CHANGELOG.md")?.owner).toBe("tools/changesets");
  });

  test("fails only the resources of an owner with unmet requirements", async () => {
    const config = createConfig([
      {
        name: "needs-eslint",
        requires: ["tools/eslint"],
        owns: {
          files: {
            "needs.out": {
              committed: false,
              locate: () => {
                return Promise.resolve({ file: "needs.out" });
              },
            },
          },
        },
      },
    ]);

    const resources = await config.resolve("resources");

    const failure = expect.objectContaining({
      message:
        'File resource "needs.out" of needs-eslint cannot be located: needs-eslint requires tools/eslint, which is inactive: install eslint',
      cause: expect.any(Error),
    });

    expect(() => resources.get("needs.out")).toThrow(failure);
    expect(() => resources.list({ committed: false })).toThrow(failure);
    expect(() => resources.get("gitignore")).not.toThrow();
    expect(() => resources.list({ generated: true })).not.toThrow();
  });

  test("fails on a part of a file closed to parts", () => {
    expect(() => {
      return createConfig([
        {
          name: "closed-fixture",
          owns: {
            files: {
              closed: {
                locate: async () => {
                  return { file: "closed.json" };
                },
              },
            },
          },
        },
        {
          name: "writer-fixture",
          owns: {
            parts: { "closed#field": true },
          },
        },
      ]);
    }).toThrow(
      'writer-fixture owns part "closed#field", but closed-fixture does not open "closed" to parts',
    );
  });

  test("fails on a part of an unowned file", () => {
    expect(() => {
      return createConfig([
        {
          name: "writer-fixture",
          owns: {
            parts: { "missing#field": true },
          },
        },
      ]);
    }).toThrow(
      'writer-fixture owns part "missing#field" of "missing", which no extension owns',
    );
  });
});
