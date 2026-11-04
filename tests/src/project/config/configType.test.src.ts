import { describe, expectTypeOf, test } from "vitest";
import type { InferInput } from "valibot";

import type { configSchema } from "#config/config/schemas/configSchema";
import type { Config } from "#config/types/Config";

describe("Config", () => {
  test("accepts exactly what the config schema accepts", () => {
    expectTypeOf<Config>().toExtend<InferInput<typeof configSchema>>();
    expectTypeOf<InferInput<typeof configSchema>>().toExtend<Config>();
  });
});
