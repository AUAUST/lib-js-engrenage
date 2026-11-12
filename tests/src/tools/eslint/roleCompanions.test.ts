import { describe, expect, test } from "vitest";

import { createProjectLinter } from "#tests/utils/createProjectLinter";
import { renderCodeRoles } from "#tests/utils/renderCodeRoles";

const guardsRole = '{ name: "guards", companions: { resolve: ({ name }) => [`src/assert/assert${name.slice(2)}.ts`, ...extra], description: "src/assert/assert<Name>.ts" } }';

async function createLinter(
  extra: readonly string[] = [],
  files: Readonly<Record<string, string>> = {},
) {
  const { lint } = await createProjectLinter(
    `const extra = ${JSON.stringify(extra)};\n\nexport default { preset: "library", src: { roles: [...${renderCodeRoles()}, ${guardsRole}, { name: "assert" }, { name: "notes" }] } };\n`,
    {
      "src/guards/isString.ts": "export const isString = 1;\n",
      "src/notes/isString.ts": "export const isString = 1;\n",
      ...files,
    },
  );

  return async (filePath: string) => {
    return (await lint(filePath, "auaust/role-companions")).map(
      ({ line, message }) => `${line}:${message}`,
    );
  };
}

describe("role companions", () => {
  test("report a missing companion until it exists", async () => {
    expect(await (await createLinter())("src/guards/isString.ts")).toEqual([
      "1:The guards role requires src/assert/assertString.ts for this module; create it.",
    ]);

    expect(
      await (
        await createLinter([], {
          "src/assert/assertString.ts": "export const assertString = 1;\n",
        })
      )("src/guards/isString.ts"),
    ).toEqual([]);
  });

  test("name only the absent companion", async () => {
    expect(
      await (
        await createLinter(["src/ensure/ensureString.ts"], {
          "src/ensure/ensureString.ts": "export const ensureString = 1;\n",
        })
      )("src/guards/isString.ts"),
    ).toEqual([
      "1:The guards role requires src/assert/assertString.ts for this module; create it.",
    ]);
  });

  test("leave a role without companions alone", async () => {
    expect(await (await createLinter())("src/notes/isString.ts")).toEqual([]);
  });
});
