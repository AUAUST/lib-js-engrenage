import { describe, expect, test } from "vitest";

import { utils } from "#project/roles/index";
import { collectChanges, runSync } from "#project/sync/index";
import { createBarrelProject } from "#tests/utils/createBarrelProject";
import { createBarrelRenderer } from "#tools/typescript/operations/createBarrelRenderer";
import { planBarrelBlock } from "#tools/typescript/operations/planBarrelBlock";
import { loadValidatedConfig } from "#workflows/config/index";

const builtinsBarrel = "src/workflows/builtins/index.ts";

function createKit({
  files,
  isPublic = false,
}: {
  files: Record<string, string>;
  isPublic?: boolean;
}) {
  return createBarrelProject({
    files,
    roles: [
      utils({
        exports: { values: "named-match", types: "none" },
      }),
    ],
    domains: {
      "*": { public: isPublic },
    },
  });
}

describe("barrel-blocks sync target", () => {
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

  test("lists engrenage's built-in extensions under their domain names", async () => {
    const config = await loadValidatedConfig();

    const render = await createBarrelRenderer(config);

    const { lines } = await render(
      await planBarrelBlock(config, builtinsBarrel, "extension"),
      new Map(),
    );

    expect(lines).toHaveLength(34);

    expect(lines).toContain(
      'export { default as projectBuild } from "#project/build/extension";',
    );

    expect(lines).toContain(
      'export { default as toolsShopifyTheme } from "#tools/shopify/theme/extension";',
    );

    expect(lines.join("\n")).not.toContain("roles/operations/extension");
  });
});
