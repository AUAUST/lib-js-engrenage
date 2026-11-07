import { describe, expectTypeOf, test } from "vitest";

import type { listConfigSections } from "#workflows/config/operations/listConfigSections";
import type { ConfigInput } from "#workflows/config/types/ConfigInput";

describe("ConfigInput", () => {
  test("has a key for each config section", () => {
    expectTypeOf<keyof ConfigInput>().toEqualTypeOf<
      keyof ReturnType<typeof listConfigSections>
    >();
  });
});
