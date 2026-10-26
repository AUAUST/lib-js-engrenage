import { describe, expect, test } from "vitest";

import { normalizeRuleSchema } from "#eslint/utils/normalizeRuleSchema";

describe("normalizeRuleSchema", () => {
  test("folds the parent properties into requirement-only branches", () => {
    const schema = {
      type: "array",
      items: {
        type: "object",
        properties: {
          object: {
            type: "string",
          },
          property: {
            type: "string",
          },
        },
        anyOf: [
          {
            required: ["object"],
          },
          {
            required: ["property"],
          },
        ],
        additionalProperties: false,
      },
    };

    const properties = schema.items.properties;

    expect(normalizeRuleSchema(schema)).toEqual({
      type: "array",
      items: {
        anyOf: [
          {
            type: "object",
            properties,
            required: ["object"],
            additionalProperties: false,
          },
          {
            type: "object",
            properties,
            required: ["property"],
            additionalProperties: false,
          },
        ],
      },
    });
  });

  test("keeps branches that declare their own properties", () => {
    const schema = {
      type: "object",
      properties: {
        name: {
          type: "string",
        },
      },
      oneOf: [
        {
          properties: {
            group: {
              type: "string",
            },
          },
        },
        {
          required: ["name"],
        },
      ],
    };

    expect(normalizeRuleSchema(schema)).toEqual(schema);
  });
});
