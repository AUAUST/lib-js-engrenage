import { parse } from "valibot";
import { expect, test } from "vitest";

import { role, rolesSchema } from "#batiment/roles/index";

test("role returns its definition frozen, accepted as a source role", () => {
  const definition = {
    name: "plugins",
    purpose: "p",
    exports: "named-match",
  } as const;

  const declared = role(definition);

  expect(Object.isFrozen(declared)).toBe(true);
  expect(declared).toEqual(definition);
  expect(parse(rolesSchema.schema, [declared])).toEqual([definition]);
});
