import { sort } from "@auaust/primitive-kit/arrays";
import { keys } from "@auaust/toolkit/object";

import type { ConfigSchema } from "#scripts/codegen/types/ConfigSchema";
import type { ObjectConfigSchema } from "#scripts/codegen/types/ObjectConfigSchema";

const adjustmentKeys = ["append", "exclude", "prepend"];

export function isListAdjustmentSchema(schema: ConfigSchema): boolean {
  const { entries } = schema as ConfigSchema & Partial<ObjectConfigSchema>;

  return (
    schema.type === "strict_object" &&
    entries !== undefined &&
    sort(keys(entries)).join() === adjustmentKeys.join()
  );
}
