import { toJsonSchema } from "@valibot/to-json-schema";
import { describe, expect, test } from "vitest";

import { roleSchema } from "#project/roles/config/schemas/roleSchema";

describe("role contract defaults", () => {
  test("documents boolean and numeric defaults as values, not strings", () => {
    const json = JSON.stringify(
      toJsonSchema(roleSchema.schema, { errorMode: "ignore" }),
    );

    expect(json).toContain("@default false");
    expect(json).toContain("@default 0, so the role is flat");
    expect(json).not.toContain("@default `false`");
    expect(json).not.toContain("@default `0`");
  });
});
