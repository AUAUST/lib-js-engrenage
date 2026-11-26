import { looseObject, optional, picklist, strictObject, string } from "valibot";
import { describe, expect, test } from "vitest";

import {
  listOptionSchema,
  managedListOptionSchema,
} from "#foundation/options/index";
import { renderConfigType } from "#scripts/codegen/operations/renderConfigType";
import type { ConfigSchema } from "#scripts/codegen/types/ConfigSchema";

function render(
  core: ConfigSchema,
  types: ReadonlyMap<unknown, string> = new Map(),
) {
  return renderConfigType({
    core,
    name: "TestInput",
    names: new Map(),
    types,
    description: undefined,
  });
}

describe("renderConfigType", () => {
  test("lets optional properties take undefined", async () => {
    const declarations = await render(
      strictObject({
        label: optional(string()),
      }),
    );

    expect(declarations).toContain("label?: (string | undefined)");
  });

  test("types list options by their items", async () => {
    const declarations = await render(
      strictObject({
        kinds: listOptionSchema(picklist(["a", "b"])),
        names: managedListOptionSchema(string()),
      }),
    );

    expect(declarations).toContain('kinds: ListOption<"a" | "b">');

    expect(declarations).toContain("names: ManagedListOption<string>");
  });

  test("types a named schema by its mapped type", async () => {
    const tool = picklist(["one"]);

    const declarations = await render(
      strictObject({
        tool,
      }),
      new Map([[tool, "keyof Engrenage.Tools"]]),
    );

    expect(declarations).toContain("tool: keyof Engrenage.Tools");
  });

  test("keeps loose objects open", async () => {
    const declarations = await render(looseObject({}));

    expect(declarations).toContain("[k: string]: unknown");
  });
});
