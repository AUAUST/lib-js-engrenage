import { describe, expect, onTestFinished, test } from "vitest";

import { entrypoint } from "#project/roles/index";
import { createProjectLinter } from "#tests/utils/createProjectLinter";
import { renderCodeRoles } from "#tests/utils/renderCodeRoles";
import { apiInterface } from "#tools/eslint/rules/apiInterface";

const ruleKey = "__engrenageApiInterfaceRule";

const apisRole = `{ name: "apis", typeOnly: true, rules: { "api-interface": globalThis.${ruleKey} } }`;

async function createLinter() {
  // @debt the temporary config cannot import `@auaust/engrenage`, so the rule crosses through `globalThis`; test configs should resolve the package
  Reflect.set(globalThis, ruleKey, apiInterface);

  onTestFinished(() => {
    Reflect.deleteProperty(globalThis, ruleKey);
  });

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
