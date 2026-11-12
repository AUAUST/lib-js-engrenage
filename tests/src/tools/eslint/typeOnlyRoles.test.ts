import { describe, expect, test } from "vitest";

import { createRolePreset, entry, type Role } from "@auaust/engrenage/roles";

import { createProjectLinter } from "#tests/utils/createProjectLinter";
import { renderCodeRoles } from "#tests/utils/renderCodeRoles";

async function createLinter(config = "", roles: readonly Role[] = []) {
  const { lint } = await createProjectLinter(
    `export default { preset: "library", ${config} src: { roles: ${renderCodeRoles(entry(), ...roles)}, structure: { layers: ["project"] } } };\n`,
    {
      "src/project/feature/index.ts": "export {};\n",
      "src/project/feature/utils/own.ts": "export const own = 1;\n",
      "src/project/feature/types/Seed.ts": "export type Seed = 1;\n",
      "src/project/feature/shapes/Seed.ts": "export type Seed = 1;\n",
    },
  );

  return async (filePath: string, source: string) => {
    const messages = await lint(
      filePath,
      (ruleId) => {
        return (
          ruleId.startsWith("auaust/import-") ||
          ruleId === "auaust/type-only-roles" ||
          ruleId === "@typescript-eslint/no-import-type-side-effects"
        );
      },
      source,
    );

    return messages.map(({ ruleId }) => ruleId);
  };
}

describe("type-only roles", () => {
  test("accept top-level type imports of the domain's runtime modules and reject values and inline type specifiers", async () => {
    const lint = await createLinter();

    expect(
      await lint(
        "src/project/feature/types/Own.ts",
        'import type { own } from "#project/feature/utils/own";\n\nexport type Own = typeof own;\n',
      ),
    ).toEqual([]);

    expect(
      await lint("src/project/feature/types/Own.ts", "export const Own = 1;\n"),
    ).toEqual(["auaust/type-only-roles"]);

    expect(
      await lint(
        "src/project/feature/types/Own.ts",
        'import { type own } from "#project/feature/utils/own";\n\nexport type Own = typeof own;\n',
      ),
    ).not.toEqual([]);
  });

  test("allow only type re-exports", async () => {
    const lint = await createLinter();

    const file = "src/project/feature/types/Own.ts";
    const source = '"#project/feature/utils/own"';

    expect(await lint(file, `export type { own } from ${source};\n`)).toEqual(
      [],
    );

    expect(
      await lint(file, `export { type own } from ${source};\n`),
    ).not.toContain("auaust/type-only-roles");

    expect(await lint(file, `export type * from ${source};\n`)).toEqual([]);

    expect(await lint(file, `export { own } from ${source};\n`)).toContain(
      "auaust/type-only-roles",
    );

    expect(await lint(file, `export * from ${source};\n`)).toContain(
      "auaust/type-only-roles",
    );
  });

  test("accept an ambient global augmentation", async () => {
    const lint = await createLinter();

    const file = "src/project/feature/types/Own.ts";

    expect(
      await lint(
        file,
        "declare global {\n  interface Own {}\n}\n\nexport {};\n",
      ),
    ).toEqual([]);

    expect(
      await lint(
        file,
        "export namespace Own {\n  export const value = 1;\n}\n",
      ),
    ).toContain("auaust/type-only-roles");
  });

  test("apply to a project role marked typeOnly", async () => {
    const shapes = createRolePreset({
      name: "shapes",
      typeOnly: true,
      exports: "named-match",
    });

    const lint = await createLinter("", [shapes()]);

    expect(
      await lint(
        "src/project/feature/shapes/Shape.ts",
        "export const Shape = 1;\n",
      ),
    ).toEqual(["auaust/type-only-roles"]);
  });

  test("are off without verbatimModuleSyntax", async () => {
    const lint = await createLinter(
      "typescript: { verbatimModuleSyntax: false },",
    );

    expect(
      await lint("src/project/feature/types/Own.ts", "export const Own = 1;\n"),
    ).toEqual([]);
  });
});
