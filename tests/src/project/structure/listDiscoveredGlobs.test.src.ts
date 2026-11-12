import { expect, test } from "vitest";

import { noRoles } from "#project/structure/constants";
import { listDiscoveredGlobs } from "#project/structure/utils/listDiscoveredGlobs";
import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";

function contract(
  overrides: Partial<ResolvedRoleContract>,
): ResolvedRoleContract {
  return {
    file: undefined,
    fileDescription: undefined,
    companions: undefined,
    accepts: undefined,
    nesting: 0,
    roles: undefined,
    categories: undefined,
    exports: { values: undefined, types: undefined },
    index: false,
    public: false,
    subpath: false,
    reexport: undefined,
    collected: false,
    discovered: false,
    scoped: false,
    typeOnly: false,
    strict: false,
    unique: false,
    required: false,
    purpose: undefined,
    effects: undefined,
    rules: undefined,
    ...overrides,
  };
}

test("lists a discovered directory role as everything inside it", () => {
  expect(
    listDiscoveredGlobs({
      roles: { conventions: contract({ discovered: true }) },
      aliases: {},
      effects: noRoles.effects,
    }),
  ).toEqual(["**/conventions/**"]);
});

test("lists the files of a discovered file role and skips undiscovered roles", () => {
  expect(
    listDiscoveredGlobs({
      roles: {
        "setup.ts": contract({
          discovered: true,
          file: ["setup.ts"],
        }),
        "utils": contract({}),
      },
      aliases: {},
      effects: noRoles.effects,
    }),
  ).toEqual(["**/setup.ts"]);
});
