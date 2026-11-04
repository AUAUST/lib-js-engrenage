import { expect, test } from "vitest";

import { listDiscoveredGlobs } from "#project/structure/utils/listDiscoveredGlobs";
import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";

function contract(
  overrides: Partial<ResolvedRoleContract>,
): ResolvedRoleContract {
  return {
    file: undefined,
    accepts: undefined,
    nesting: 0,
    roles: undefined,
    categories: undefined,
    exports: undefined,
    index: false,
    public: false,
    discovered: false,
    scoped: false,
    purpose: undefined,
    ...overrides,
  };
}

test("lists a discovered directory role as everything inside it", () => {
  expect(
    listDiscoveredGlobs({
      roles: { conventions: contract({ discovered: true }) },
      aliases: {},
    }),
  ).toEqual(["**/conventions/**"]);
});

test("lists the files of a discovered file role and skips undiscovered roles", () => {
  expect(
    listDiscoveredGlobs({
      roles: {
        "setup.ts": contract({ discovered: true, file: ["setup.ts"] }),
        "utils": contract({}),
      },
      aliases: {},
    }),
  ).toEqual(["**/setup.ts"]);
});
