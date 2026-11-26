import { describe, expect, test } from "vitest";

import { createRuleDeclarations } from "#scripts/codegen/operations/createRuleDeclarations";

function createSource(properties: Record<string, unknown>) {
  return {
    name: "TestRules",
    prefix: "test",
    plugin: {
      rules: {
        rule: {
          meta: {
            schema: [
              {
                type: "object",
                properties: {
                  options: {
                    type: "object",
                    properties,
                    additionalProperties: true,
                  },
                  flags: {
                    type: "object",
                    additionalProperties: {
                      type: "boolean",
                    },
                  },
                },
              },
            ],
          },
          create() {
            return {};
          },
        },
      },
    },
  };
}

describe("createRuleDeclarations", () => {
  test("declares open index signatures as plain unknown", async () => {
    const declarations = await createRuleDeclarations(
      createSource({
        name: {
          type: "string",
        },
      }),
    );

    expect(declarations).toContain("[k: string]: unknown");

    expect(declarations).not.toContain("unknown | undefined");
  });

  test("keeps undefined on typed index signatures", async () => {
    const declarations = await createRuleDeclarations(createSource({}));

    expect(declarations).toContain("[k: string]: boolean | undefined");
  });
});
