import { describe, expect, test } from "vitest";

import { entrypoint } from "#project/roles/index";
import { createProjectLinter } from "#tests/utils/createProjectLinter";
import { renderCodeRoles } from "#tests/utils/renderCodeRoles";

const apisRole = '{ name: "apis", typeOnly: true }';

async function createLinter() {
  const roles = renderCodeRoles(entrypoint()).slice(0, -1);

  const { lint } = await createProjectLinter(
    `export default { preset: "library", src: { roles: ${roles}, ${apisRole}], structure: { layers: ["project"] } } };\n`,
    {
      "src/project/feature/index.ts": "export {};\n",
      "src/project/feature/apis/Store.ts": "export {};\n",
    },
  );

  return async (source: string) => {
    const messages = await lint(
      "src/project/feature/apis/Store.ts",
      "roles/apis/api-interface",
      source,
    );

    return messages.map(({ messageId }) => messageId);
  };
}

describe("api-interface", () => {
  test("accept an interface with one method", async () => {
    const lint = await createLinter();

    expect(
      await lint("export interface Store {\n  get(key: string): string;\n}\n"),
    ).toEqual([]);
  });

  test("report an interface without methods", async () => {
    const lint = await createLinter();

    expect(
      await lint("export interface Store {\n  readonly key: string;\n}\n"),
    ).toEqual(["methods"]);
  });

  test("report a module exporting two interfaces", async () => {
    const lint = await createLinter();

    expect(
      await lint(
        "export interface Store {\n  get(key: string): string;\n}\n\nexport interface Entry {\n  read(): string;\n}\n",
      ),
    ).toEqual(["single"]);
  });
});
