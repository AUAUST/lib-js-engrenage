import { describe, expect, test } from "vitest";

import { schemas, types, utils } from "#project/roles/index";
import { collectChanges, runSync } from "#project/sync/index";
import { createBarrelProject } from "#tests/utils/createBarrelProject";
import type { Role } from "#batiment/roles/index";

function createKit({
  files,
  isPublic = false,
  published,
  roles = [
    utils({
      exports: { values: "named-match", types: "none" },
    }),
  ],
}: {
  files: Record<string, string>;
  isPublic?: boolean;
  published?: boolean;
  roles?: readonly Role[];
}) {
  return createBarrelProject({
    files,
    roles,
    ...(published === undefined ? {} : { published }),
    domains: {
      "*": { public: isPublic },
    },
  });
}

describe("barrel directive", () => {
  test("keeps hand-written lines beside a role's modules, and sync --check reports a module added without sync", async () => {
    const { project, config, sync } = createKit({
      files: {
        "src/modules/object/index.ts": 'export const name = "object";\n\n// @barrel utils\n// @end\n',
        "src/modules/object/utils/keys.ts": "export function keys() {}\n",
        "src/modules/object/utils/hasOwn.ts": "export function hasOwn() {}\n",
        "src/modules/guard/utils/isString.ts": "export function isString() {}\n",
      },
    });

    await sync();

    expect(project.read("src/modules/object/index.ts")).toBe(
      `export const name = "object";

// @barrel utils
export { hasOwn } from "#modules/object/utils/hasOwn";
export { keys } from "#modules/object/utils/keys";
// @end
`,
    );

    project.write(
      "src/modules/object/utils/values.ts",
      "export function values() {}\n",
    );

    const copy = config.context.copy();

    expect(await runSync(copy)).toEqual([]);

    expect(await collectChanges(copy, { check: true })).not.toEqual([]);
  });

  test("orders a block mixing export groups as the export order lint wants", async () => {
    const { project, sync } = createKit({
      files: {
        "src/modules/object/index.ts": "// @barrel utils\n// @end\n\n// @barrel schemas\n// @end\n\n// @barrel types\n// @end\n",
        "src/modules/object/utils/keys10.ts": "export function keys10() {}\n",
        "src/modules/object/utils/keys2.ts": "export function keys2() {}\n",
        "src/modules/object/schemas/shape.ts": "export const shape = {};\n",
        "src/modules/object/types/Entry.ts": "export interface Entry {}\n",
      },
      roles: [utils(), schemas({ exports: "named" }), types()],
    });

    await sync();

    expect(project.read("src/modules/object/index.ts")).toBe(
      `// @barrel utils
export { keys2 } from "#modules/object/utils/keys2";
export { keys10 } from "#modules/object/utils/keys10";
export type * from "#modules/object/utils/keys2";
export type * from "#modules/object/utils/keys10";
// @end

// @barrel schemas
export * from "#modules/object/schemas/shape";
// @end

// @barrel types
export type * from "#modules/object/types/Entry";
// @end
`,
    );
  });

  test("fails on a barrel marker of a modules role in an unpublished index, filling it in a library", async () => {
    const files = {
      "src/modules/object/index.ts": "// @barrel utils\n// @end\n",
      "src/modules/object/utils/keys.ts": "export function keys() {}\n",
    };

    await expect(
      runSync(
        createKit({
          files,
          roles: [utils()],
          published: false,
        }).config,
      ),
    ).rejects.toThrow('remove its "@barrel utils" marker');

    const library = createKit({ files, roles: [utils()] });

    await library.sync();

    expect(library.project.read("src/modules/object/index.ts")).toContain(
      'export { keys } from "#modules/object/utils/keys";',
    );
  });

  test("fails on a marker naming an unknown role, naming the file and the role", async () => {
    const { config } = createKit({
      files: {
        "src/modules/object/index.ts": "// @barrel missing\n// @end\n",
      },
    });

    await expect(runSync(config)).rejects.toThrow(
      'Unknown role "missing" in the barrel marker of src/modules/object/index.ts',
    );
  });

  test("keeps a hand-written root export beside the re-exports of each public domain", async () => {
    const { project, sync } = createKit({
      isPublic: true,
      files: {
        "src/entry.ts": 'export const BUILD = "dev";\n\n// @barrel domains\n// @end\n',
        "src/modules/object/utils/keys.ts": "export function keys() {}\n",
        "src/modules/guard/utils/isString.ts": "export function isString() {}\n",
      },
    });

    await sync();

    expect(project.read("src/entry.ts")).toBe(
      `export const BUILD = "dev";

// @barrel domains
export * as guard from "#modules/guard/entry";
export * as object from "#modules/object/entry";
// @end
`,
    );
  });
});
