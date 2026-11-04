import { describe, expectTypeOf, test } from "vitest";
import type { InferInput } from "valibot";

import type { configSchema } from "#project/config/config/schemas/configSchema";
import type { ConfigInput } from "#project/config/types/ConfigInput";

describe("ConfigInput", () => {
  test("accepts exactly what the config schema accepts", () => {
    expectTypeOf<ConfigInput>().toExtend<InferInput<typeof configSchema>>();
    expectTypeOf<InferInput<typeof configSchema>>().toExtend<ConfigInput>();
  });
});
