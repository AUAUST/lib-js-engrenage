import { describe, expect, test } from "vitest";

import { createRolePreset, entry } from "@auaust/engrenage/roles";

import { createProjectLinter } from "#tests/utils/createProjectLinter";
import { renderCodeRoles } from "#tests/utils/renderCodeRoles";

const exported = "export const value = 1;\n";

async function createLinter() {
  const views = createRolePreset({ name: "views", file: "*View.tsx" });

  const { lint } = await createProjectLinter(
    `export default { preset: "library", environments: { src: { languages: [{ name: "typescript", options: { tsx: "solid" } }] } }, src: { roles: ${renderCodeRoles(entry(), views())}, structure: { layers: ["project"] } } };\n`,
    {
      "src/project/feature/index.ts": exported,
      "src/project/feature/CardView.tsx": exported,
      "src/project/feature/utils/format.ts": exported,
      "src/project/other/index.ts": exported,
    },
  );

  return async function lintImports(file: string, source: string) {
    const messages = await lint(
      file,
      (ruleId) => ruleId.startsWith("auaust/import-"),
      source,
    );

    return messages.map(({ ruleId, message }) => {
      return { ruleId, message };
    });
  };
}

describe("tsx module imports", () => {
  test("reach a .tsx module's role from a .ts importer, through an alias or a relative path", async () => {
    const lint = await createLinter();

    expect(
      await lint(
        "src/project/other/index.ts",
        'export { value } from "#project/feature/CardView";\n',
      ),
    ).toEqual([expect.objectContaining({ ruleId: "auaust/import-surfaces" })]);

    expect(
      await lint(
        "src/project/feature/index.ts",
        'export { value } from "./CardView";\n',
      ),
    ).toEqual([
      expect.objectContaining({
        ruleId: "auaust/import-specifiers",
        message: expect.stringContaining("#project/feature/CardView"),
      }),
    ]);
  });

  test("reach a .ts module from a .tsx importer", async () => {
    const lint = await createLinter();

    expect(
      await lint(
        "src/project/feature/CardView.tsx",
        'export { value } from "./utils/format";\n',
      ),
    ).toEqual([
      expect.objectContaining({
        ruleId: "auaust/import-specifiers",
        message: expect.stringContaining("#project/feature/utils/format"),
      }),
    ]);
  });
});
