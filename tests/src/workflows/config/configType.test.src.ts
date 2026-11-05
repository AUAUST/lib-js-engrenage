import { describe, expectTypeOf, test } from "vitest";
import type { InferInput } from "valibot";

import type { ConfigInput } from "#workflows/config/types/ConfigInput";
import type { configSchema } from "#workflows/registry/config/schemas/configSchema";

describe("ConfigInput", () => {
  test("accepts exactly what the config schema accepts", () => {
    expectTypeOf<ConfigInput>().toExtend<InferInput<typeof configSchema>>();
    expectTypeOf<InferInput<typeof configSchema>>().toExtend<ConfigInput>();
  });
});
